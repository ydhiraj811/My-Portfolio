import ReactGA from "react-ga4";
import Clarity from "@microsoft/clarity";

export function initAnalytics() {
  if (import.meta.env.PROD) {
    ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);

    Clarity.init(import.meta.env.VITE_CLARITY_PROJECT_ID);

    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname,
    });
  }
}