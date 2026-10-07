import {
  html,
  view,
  viewState,
  afterRender,
  keepRef,
  uniqueId,
  elementRef,
  styles,
  live,
  nothing,
} from "../ui/view.js";
import { ChevronDown, X } from "../ui/icons.js";
import { monthsBefore, shiftDate } from "../lib/atlas-models.js";
import { dateOffset, dateRangeError, rangeLabels } from "../lib/date-range.js";
import "../date-range.css";

// Draft dates belong to this dialog. Only Apply changes the chart's query.
const DateRangePicker = view(function DateRangePicker({
  today,
  range,
  period,
  onRange,
  onCustomRange,
}) {
  const [open, setOpen] = viewState(false);
  const [from, setFrom] = viewState(period.from);
  const [to, setTo] = viewState(period.to);
  const dialogRef = keepRef(null);
  const axisRef = keepRef(null);
  const drag = keepRef(null);
  const id = uniqueId();
  const earliest = monthsBefore(today, 120);
  const totalDays = dateOffset(earliest, today);
  const error = dateRangeError(from, to, today);
  // Keep the axis usable while a date field is temporarily empty or invalid.
  const startDay = dateOffset(earliest, error ? period.from : from);
  const endDay = dateOffset(earliest, error ? period.to : to);
  const percent = (day) => (day / totalDays) * 100 + "%";

  afterRender(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const closeOnNavigation = () => setOpen(false);
    window.addEventListener("hashchange", closeOnNavigation);
    return () => {
      window.removeEventListener("hashchange", closeOnNavigation);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      drag.current = null;
    };
  }, [open]);

  function openDialog() {
    setFrom(period.from);
    setTo(period.to);
    setOpen(true);
  }

  function moveBoundary(edge, day, start = startDay, end = endDay) {
    if (edge === "from") {
      setFrom(shiftDate(earliest, Math.max(0, Math.min(end - 1, day))));
      setTo(shiftDate(earliest, end));
    } else {
      setFrom(shiftDate(earliest, start));
      setTo(shiftDate(earliest, Math.max(start + 1, Math.min(totalDays, day))));
    }
  }

  function pointerDay(event, bounds) {
    return Math.round(
      ((event.clientX - bounds.left) / bounds.width) * totalDays,
    );
  }

  function startDrag(event, edge) {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const bounds = axisRef.current.getBoundingClientRect();
    const day = pointerDay(event, bounds);
    const nearest =
      Math.abs(day - startDay) <= Math.abs(day - endDay) ? "from" : "to";
    const selectedEdge = edge || nearest;
    drag.current = { edge: selectedEdge, bounds, start: startDay, end: endDay };
    event.currentTarget.setPointerCapture(event.pointerId);
    axisRef.current
      .querySelector(`[data-edge="${selectedEdge}"]`)
      .focus({ preventScroll: true });
    if (!edge) moveBoundary(selectedEdge, day);
  }

  function moveDrag(event) {
    const current = drag.current;
    if (current)
      moveBoundary(
        current.edge,
        pointerDay(event, current.bounds),
        current.start,
        current.end,
      );
  }

  function stopDrag(event) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleKeys(event, edge) {
    const current = edge === "from" ? startDay : endDay;
    const low = edge === "from" ? 0 : startDay + 1;
    const high = edge === "from" ? endDay - 1 : totalDays;
    const keys = {
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      PageDown: current - 30,
      PageUp: current + 30,
      Home: low,
      End: high,
    };
    if (Object.hasOwn(keys, event.key)) {
      event.preventDefault();
      moveBoundary(edge, keys[event.key]);
    }
  }

  return html`
    <div class="atlas-range-controls">
      <div class="atlas-range-picker" role="group" aria-label="走势图范围">
        ${[30, 90, 365, 1826].map(
          (value) => html`
            <button
              type="button"
              aria-pressed=${range === value}
              @click=${() => onRange(value)}
            >
              ${rangeLabels[value]}
            </button>
          `,
        )}
        <button
          type="button"
          class="atlas-custom-range"
          aria-pressed=${range === "custom"}
          aria-haspopup="dialog"
          aria-expanded=${open}
          aria-controls=${id}
          @click=${openDialog}
        >
          自定义时间${ChevronDown({ size: 13 })}
        </button>
      </div>
      ${range === "custom" ? html`<output class="atlas-selected-range"><time>${period.from}</time><span>至</span><time>${period.to}</time></output>` : nothing}
    </div>
    <dialog
      class="date-range-dialog"
      id=${id}
      ${elementRef(dialogRef)}
      aria-labelledby=${id + "-title"}
      @cancel=${(event) => {
        event.preventDefault();
        setOpen(false);
      }}
      @close=${() => setOpen(false)}
    >
      <form
        novalidate
        @submit=${(event) => {
          event.preventDefault();
          if (error) return;
          setOpen(false);
          onCustomRange({ from, to });
        }}
      >
        <header class="date-range-heading">
          <h3 id=${id + "-title"}>自定义时间</h3>
          <button
            type="button"
            class="icon-button"
            aria-label="关闭时间选择"
            @click=${() => setOpen(false)}
          >
            ${X({ size: 19 })}
          </button>
        </header>
        <div class="date-range-fields">
          <label
            ><span>开始日期</span
            ><input
              type="date"
              required
              min=${earliest}
              max=${today}
              .value=${live(from)}
              aria-invalid=${!!error}
              aria-describedby=${error ? id + "-error" : nothing}
              @input=${(event) => setFrom(event.target.value)}
          /></label>
          <label
            ><span>结束日期</span
            ><input
              type="date"
              required
              min=${earliest}
              max=${today}
              .value=${live(to)}
              aria-invalid=${!!error}
              aria-describedby=${error ? id + "-error" : nothing}
              @input=${(event) => setTo(event.target.value)}
          /></label>
        </div>
        <div
          class="date-range-axis"
          ${elementRef(axisRef)}
          role="group"
          aria-label="近十年时间范围"
          @pointerdown=${(event) => startDrag(event)}
          @pointermove=${moveDrag}
          @pointerup=${stopDrag}
          @pointercancel=${stopDrag}
          @lostpointercapture=${() => {
            drag.current = null;
          }}
        >
          <div class="date-range-rail" aria-hidden="true"></div>
          <div
            class="date-range-window"
            aria-hidden="true"
            style=${styles({ left: percent(startDay), width: percent(endDay - startDay) })}
          ></div>
          ${["from", "to"].map(
            (edge) => html`
              <button
                type="button"
                class=${"date-range-handle is-" + edge}
                data-edge=${edge}
                role="slider"
                aria-label=${edge === "from" ? "开始日期" : "结束日期"}
                aria-valuemin=${edge === "from" ? 0 : startDay + 1}
                aria-valuemax=${edge === "from" ? endDay - 1 : totalDays}
                aria-valuenow=${edge === "from" ? startDay : endDay}
                aria-valuetext=${shiftDate(earliest, edge === "from" ? startDay : endDay)}
                style=${styles({ left: percent(edge === "from" ? startDay : endDay) })}
                @pointerdown=${(event) => startDrag(event, edge)}
                @keydown=${(event) => handleKeys(event, edge)}
              ></button>
            `,
          )}
        </div>
        <div class="date-range-years" aria-hidden="true">
          ${[120, 96, 72, 48, 24, 0].map((months) => html`<span>${monthsBefore(today, months).slice(0, 4)}</span>`)}
        </div>
        ${error ? html`<p class="date-range-error" id=${id + "-error"} role="alert">${error}</p>` : nothing}
        <footer class="date-range-actions">
          <button
            type="button"
            class="date-range-full"
            @click=${() => {
              setFrom(earliest);
              setTo(today);
            }}
          >
            近 10 年
          </button>
          <button
            type="button"
            class="date-range-cancel"
            @click=${() => setOpen(false)}
          >
            取消
          </button>
          <button type="submit" class="date-range-apply" ?disabled=${!!error}>
            应用
          </button>
        </footer>
      </form>
    </dialog>
  `;
});

export default DateRangePicker;
