import {
  html as markup,
  svg as svgMarkup,
  content as renderContent,
  view,
  viewState,
  afterRender,
  compute,
  keepRef,
  uniqueId,
  elementRef,
  styles,
  ifDefined,
  live,
  keyed,
  unsafeHTML,
  selectValue,
} from "../ui/view.js";
const API = "https://api.frankfurter.dev/v2/rates";
const cache = new Map();
export function fetchAtlasRates(query) {
  const cached = cache.get(query);
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 22000);
  const request = fetch(API + query, {
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("汇率服务暂不可用");
      const data = await response.json();
      if (
        !Array.isArray(data) ||
        !data.every(
          (row) =>
            typeof row?.base === "string" &&
            typeof row?.quote === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(row?.date) &&
            typeof row?.rate === "number" &&
            Number.isFinite(row.rate) &&
            row.rate > 0,
        )
      )
        throw new Error("汇率数据格式不正确");
      return data;
    })
    .catch((error) => {
      cache.delete(query);
      throw error;
    })
    .finally(() => window.clearTimeout(timeout));
  cache.set(query, request);
  if (cache.size > 60) cache.delete(cache.keys().next().value);
  return request;
}
export function useAtlasRates(query, retry = 0) {
  const [state, setState] = viewState({
    status: "loading",
    rows: [],
  });
  afterRender(() => {
    let active = true;
    if (!query) {
      setState({
        query,
        status: "ready",
        rows: [],
      });
      return;
    }
    setState({
      query,
      status: "loading",
      rows: [],
    });
    void fetchAtlasRates(query)
      .then((rows) => {
        if (active)
          setState({
            query,
            status: "ready",
            rows,
          });
      })
      .catch(() => {
        if (active)
          setState({
            query,
            status: "error",
            rows: [],
          });
      });
    return () => {
      active = false;
    };
  }, [query, retry]);
  return state.query === query
    ? state
    : {
        query,
        status: "loading",
        rows: [],
      };
}
