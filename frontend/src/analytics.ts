import ReactGA from "react-ga4";
import Clarity from "@microsoft/clarity";

export function initAnalytics() {
  if (import.meta.env.PROD) {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

    if (measurementId) {
      ReactGA.initialize(measurementId);
      ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search,
      });
    }

    if (clarityProjectId) Clarity.init(clarityProjectId);
  }
}
