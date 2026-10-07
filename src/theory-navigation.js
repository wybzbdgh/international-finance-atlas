import data from "./theory-index.json";
export const theoryIndex = data;
export const theoryHref = (id) => "#theory" + (id ? "/" + id : "");
export const theoryKinds = {
  history: "思想前史",
  theory: "理论",
  puzzle: "经验难题",
  proposal: "制度方案",
};
export const theoryEras = [
  {
    id: "origins",
    title: "货币思想前史",
    years: "古代与中世纪",
    end: 1500,
  },
  {
    id: "classical",
    title: "贸易、货币与国际调整",
    years: "16—19 世纪",
    end: 1900,
  },
  {
    id: "interwar",
    title: "汇率关系与货币秩序",
    years: "1900—1949",
    end: 1950,
  },
  {
    id: "postwar",
    title: "开放经济的政策选择",
    years: "1950—1969",
    end: 1970,
  },
  {
    id: "floating",
    title: "浮动汇率与资产市场",
    years: "1970—1979",
    end: 1980,
  },
  {
    id: "evidence",
    title: "跨期选择与经验难题",
    years: "1980—1989",
    end: 1990,
  },
  {
    id: "globalization",
    title: "资本开放与金融危机",
    years: "1990—2007",
    end: 2008,
  },
  {
    id: "contemporary",
    title: "全球金融与货币竞争",
    years: "2008 年以来",
    end: Infinity,
  },
];
export const eraForYear = (year) => theoryEras.find((era) => year < era.end);
export function rememberTheoryOrigin(id) {
  if (!window.location.hash.startsWith("#learn/")) return;
  try {
    sessionStorage.setItem("theory-origin:" + id, window.location.hash);
  } catch {
    /* Reading remains available without storage. */
  }
}
export function theoryOrigin(id) {
  try {
    const value = sessionStorage.getItem("theory-origin:" + id);
    return value?.startsWith("#learn/") ? value : null;
  } catch {
    return null;
  }
}
