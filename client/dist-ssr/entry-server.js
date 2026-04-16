import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import React__default, { createContext, useContext, useEffect, useState, useRef, useCallback, lazy, Suspense, useMemo } from "react";
import { renderToString } from "react-dom/server";
import { useQuery, keepPreviousData, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { stripBasename, UNSAFE_warning, UNSAFE_invariant, matchPath, joinPaths, Action } from "@remix-run/router";
import { UNSAFE_NavigationContext, useHref, useLocation, useNavigate, useResolvedPath, createPath, UNSAFE_DataRouterStateContext, UNSAFE_useRouteId, UNSAFE_RouteContext, UNSAFE_DataRouterContext, parsePath, Router, useParams, Routes, Route } from "react-router";
import "react-dom";
import { createClient } from "@supabase/supabase-js";
/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
const defaultMethod = "get";
const defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
function createSearchParams(init) {
  if (init === void 0) {
    init = "";
  }
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo, key) => {
    let value = init[key];
    return memo.concat(Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach((value) => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
let _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
const supportedFormEncTypes = /* @__PURE__ */ new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    process.env.NODE_ENV !== "production" ? UNSAFE_warning(false, '"' + encType + '" is not a valid `encType` for `<Form>`/`<fetcher.Form>` ' + ('and will default to "' + defaultEncType + '"')) : void 0;
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let {
        name,
        type,
        value
      } = target;
      if (type === "image") {
        let prefix = name ? name + "." : "";
        formData.append(prefix + "x", "0");
        formData.append(prefix + "y", "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return {
    action,
    method: method.toLowerCase(),
    encType,
    formData,
    body
  };
}
const _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"], _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "viewTransition", "children"], _excluded3 = ["fetcherKey", "navigate", "reloadDocument", "replace", "state", "method", "action", "onSubmit", "relative", "preventScrollReset", "viewTransition"];
const REACT_ROUTER_VERSION = "6";
try {
  window.__reactRouterVersion = REACT_ROUTER_VERSION;
} catch (e) {
}
const ViewTransitionContext = /* @__PURE__ */ React.createContext({
  isTransitioning: false
});
if (process.env.NODE_ENV !== "production") {
  ViewTransitionContext.displayName = "ViewTransition";
}
const FetchersContext = /* @__PURE__ */ React.createContext(/* @__PURE__ */ new Map());
if (process.env.NODE_ENV !== "production") {
  FetchersContext.displayName = "Fetchers";
}
if (process.env.NODE_ENV !== "production") ;
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
const ABSOLUTE_URL_REGEX$1 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const Link = /* @__PURE__ */ React.forwardRef(function LinkWithRef(_ref7, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition
  } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
  let {
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX$1.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
        process.env.NODE_ENV !== "production" ? UNSAFE_warning(false, '<Link to="' + to + '"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.') : void 0;
      }
    }
  }
  let href = useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace,
    state,
    target,
    preventScrollReset,
    relative,
    viewTransition
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    /* @__PURE__ */ React.createElement("a", _extends({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
});
if (process.env.NODE_ENV !== "production") {
  Link.displayName = "Link";
}
const NavLink = /* @__PURE__ */ React.forwardRef(function NavLinkWithRef(_ref8, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children
  } = _ref8, rest = _objectWithoutPropertiesLoose(_ref8, _excluded2);
  let path = useResolvedPath(to, {
    relative: rest.relative
  });
  let location = useLocation();
  let routerState = React.useContext(UNSAFE_DataRouterStateContext);
  let {
    navigator,
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useViewTransitionState(path) && viewTransition === true;
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  if (nextLocationPathname && basename) {
    nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
  }
  const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let renderProps = {
    isActive,
    isPending,
    isTransitioning
  };
  let ariaCurrent = isActive ? ariaCurrentProp : void 0;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp(renderProps);
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null, isTransitioning ? "transitioning" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
  return /* @__PURE__ */ React.createElement(Link, _extends({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to,
    viewTransition
  }), typeof children === "function" ? children(renderProps) : children);
});
if (process.env.NODE_ENV !== "production") {
  NavLink.displayName = "NavLink";
}
const Form = /* @__PURE__ */ React.forwardRef((_ref9, forwardedRef) => {
  let {
    fetcherKey,
    navigate,
    reloadDocument,
    replace,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition
  } = _ref9, props = _objectWithoutPropertiesLoose(_ref9, _excluded3);
  let submit = useSubmit();
  let formAction = useFormAction(action, {
    relative
  });
  let formMethod = method.toLowerCase() === "get" ? "get" : "post";
  let submitHandler = (event) => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    let submitter = event.nativeEvent.submitter;
    let submitMethod = (submitter == null ? void 0 : submitter.getAttribute("formmethod")) || method;
    submit(submitter || event.currentTarget, {
      fetcherKey,
      method: submitMethod,
      navigate,
      replace,
      state,
      relative,
      preventScrollReset,
      viewTransition
    });
  };
  return /* @__PURE__ */ React.createElement("form", _extends({
    ref: forwardedRef,
    method: formMethod,
    action: formAction,
    onSubmit: reloadDocument ? onSubmit : submitHandler
  }, props));
});
if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}
if (process.env.NODE_ENV !== "production") ;
var DataRouterHook;
(function(DataRouterHook2) {
  DataRouterHook2["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook2["UseSubmit"] = "useSubmit";
  DataRouterHook2["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook2["UseFetcher"] = "useFetcher";
  DataRouterHook2["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook2) {
  DataRouterStateHook2["UseFetcher"] = "useFetcher";
  DataRouterStateHook2["UseFetchers"] = "useFetchers";
  DataRouterStateHook2["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/v6/routers/picking-a-router.";
}
function useDataRouterContext(hookName) {
  let ctx = React.useContext(UNSAFE_DataRouterContext);
  !ctx ? process.env.NODE_ENV !== "production" ? UNSAFE_invariant(false, getDataRouterConsoleError(hookName)) : UNSAFE_invariant(false) : void 0;
  return ctx;
}
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition
  } = _temp === void 0 ? {} : _temp;
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, {
    relative
  });
  return React.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
      navigate(to, {
        replace,
        state,
        preventScrollReset,
        relative,
        viewTransition
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative, viewTransition]);
}
function useSearchParams(defaultInit) {
  process.env.NODE_ENV !== "production" ? UNSAFE_warning(typeof URLSearchParams !== "undefined", "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.") : void 0;
  let defaultSearchParamsRef = React.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = React.useRef(false);
  let location = useLocation();
  let searchParams = React.useMemo(() => (
    // Only merge in the defaults if we haven't yet called setSearchParams.
    // Once we call that we want those to take precedence, otherwise you can't
    // remove a param with setSearchParams({}) if it has an initial value
    getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current)
  ), [location.search]);
  let navigate = useNavigate();
  let setSearchParams = React.useCallback((nextInit, navigateOptions) => {
    const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(searchParams) : nextInit);
    hasSetSearchParamsRef.current = true;
    navigate("?" + newSearchParams, navigateOptions);
  }, [navigate, searchParams]);
  return [searchParams, setSearchParams];
}
function validateClientSideSubmission() {
  if (typeof document === "undefined") {
    throw new Error("You are calling submit during the server render. Try calling submit within a `useEffect` or callback instead.");
  }
}
let fetcherId = 0;
let getUniqueFetcherId = () => "__" + String(++fetcherId) + "__";
function useSubmit() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseSubmit);
  let {
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let currentRouteId = UNSAFE_useRouteId();
  return React.useCallback(function(target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    if (options.navigate === false) {
      let key = options.fetcherKey || getUniqueFetcherId();
      router.fetch(key, currentRouteId, options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        flushSync: options.flushSync
      });
    } else {
      router.navigate(options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        replace: options.replace,
        state: options.state,
        fromRouteId: currentRouteId,
        flushSync: options.flushSync,
        viewTransition: options.viewTransition
      });
    }
  }, [router, basename, currentRouteId]);
}
function useFormAction(action, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let routeContext = React.useContext(UNSAFE_RouteContext);
  !routeContext ? process.env.NODE_ENV !== "production" ? UNSAFE_invariant(false, "useFormAction must be used inside a RouteContext") : UNSAFE_invariant(false) : void 0;
  let [match] = routeContext.matches.slice(-1);
  let path = _extends({}, useResolvedPath(action ? action : ".", {
    relative
  }));
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? "?" + qs : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
function useViewTransitionState(to, opts) {
  if (opts === void 0) {
    opts = {};
  }
  let vtContext = React.useContext(ViewTransitionContext);
  !(vtContext != null) ? process.env.NODE_ENV !== "production" ? UNSAFE_invariant(false, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?") : UNSAFE_invariant(false) : void 0;
  let {
    basename
  } = useDataRouterContext(DataRouterHook.useViewTransitionState);
  let path = useResolvedPath(to, {
    relative: opts.relative
  });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
function StaticRouter({
  basename,
  children,
  location: locationProp = "/",
  future
}) {
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let action = Action.Pop;
  let location = {
    pathname: locationProp.pathname || "/",
    search: locationProp.search || "",
    hash: locationProp.hash || "",
    state: locationProp.state != null ? locationProp.state : null,
    key: locationProp.key || "default"
  };
  let staticNavigator = getStatelessNavigator();
  return /* @__PURE__ */ React.createElement(Router, {
    basename,
    children,
    location,
    navigationType: action,
    navigator: staticNavigator,
    future,
    static: true
  });
}
function getStatelessNavigator() {
  return {
    createHref,
    encodeLocation,
    push(to) {
      throw new Error(`You cannot use navigator.push() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)})\` somewhere in your app.`);
    },
    replace(to) {
      throw new Error(`You cannot use navigator.replace() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere in your app.`);
    },
    go(delta) {
      throw new Error(`You cannot use navigator.go() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${delta})\` somewhere in your app.`);
    },
    back() {
      throw new Error(`You cannot use navigator.back() on the server because it is a stateless environment.`);
    },
    forward() {
      throw new Error(`You cannot use navigator.forward() on the server because it is a stateless environment.`);
    }
  };
}
function createHref(to) {
  return typeof to === "string" ? to : createPath(to);
}
function encodeLocation(to) {
  let href = typeof to === "string" ? to : createPath(to);
  href = href.replace(/ $/, "%20");
  let encoded = ABSOLUTE_URL_REGEX.test(href) ? new URL(href) : new URL(href, "http://localhost");
  return {
    pathname: encoded.pathname,
    search: encoded.search,
    hash: encoded.hash
  };
}
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const runtimeConfig = typeof window !== "undefined" ? window.__RUNTIME_CONFIG__ : void 0;
const supabaseUrl = (runtimeConfig == null ? void 0 : runtimeConfig.SUPABASE_URL) || "https://swmvjiygqsuctoltoosi.supabase.co";
const supabaseAnonKey = (runtimeConfig == null ? void 0 : runtimeConfig.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bXZqaXlncXN1Y3RvbHRvb3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Njc4MDIsImV4cCI6MjA4OTI0MzgwMn0.DnJPprVjeqYlfMZXGg8No4zO7UBbj4-Brsf6jAySKQo";
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
const AuthContext = createContext(null);
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const ADMIN_EMAIL$1 = "fredanaman@proton.me";
function Header() {
  const { user, openAuthModal, signOut } = useAuth();
  const location = useLocation();
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: "sticky top-0 z-40",
      style: {
        background: "#ffffff",
        borderBottom: "1px solid #ebebeb",
        boxShadow: "rgba(0,0,0,0.04) 0px 1px 0px, rgba(0,0,0,0.04) 0px 2px 6px"
      },
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 h-16 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 no-underline group", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-200 group-hover:scale-105",
              style: { background: "#ff385c" },
              children: "EU"
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "text-base font-semibold",
              style: { color: "#222222", letterSpacing: "-0.18px" },
              children: "CORDIS Explorer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://cordis.europa.eu/datalab",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-sm font-medium no-underline transition-colors duration-200 hidden sm:block",
              style: { color: "#6a6a6a" },
              onMouseEnter: (e) => e.currentTarget.style.color = "#222222",
              onMouseLeave: (e) => e.currentTarget.style.color = "#6a6a6a",
              children: "About"
            }
          ),
          user ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/history",
                className: "text-sm font-medium no-underline transition-colors duration-200 hidden sm:block",
                style: { color: location.pathname === "/history" ? "#222222" : "#6a6a6a" },
                onMouseEnter: (e) => e.currentTarget.style.color = "#222222",
                onMouseLeave: (e) => e.currentTarget.style.color = location.pathname === "/history" ? "#222222" : "#6a6a6a",
                children: "History"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs hidden sm:block max-w-[140px] truncate", style: { color: "#6a6a6a" }, children: user.email }),
            user.email === ADMIN_EMAIL$1 && /* @__PURE__ */ jsx(
              Link,
              {
                to: "/admin",
                className: "btn-secondary btn-sm btn-pill no-underline",
                style: { height: "32px", fontSize: "12px", color: "#e00b41", borderColor: "rgba(224,11,65,0.3)" },
                children: "Admin"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: signOut,
                className: "btn-secondary btn-sm btn-pill",
                style: { height: "32px", fontSize: "13px" },
                children: "Sign out"
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: openAuthModal,
              className: "btn-primary btn-sm btn-pill",
              style: { height: "36px" },
              children: "Sign in"
            }
          )
        ] })
      ] })
    }
  );
}
function Footer() {
  return /* @__PURE__ */ jsx("footer", { style: { borderTop: "1px solid #ebebeb", background: "#f7f7f7" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [
    /* @__PURE__ */ jsxs("nav", { className: "flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5 text-sm", "aria-label": "Footer navigation", children: [
      /* @__PURE__ */ jsx(Link, { to: "/search", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "Browse Projects" }),
      /* @__PURE__ */ jsx(Link, { to: "/grant-search", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "Grant Search" }),
      /* @__PURE__ */ jsx(Link, { to: "/grant-match", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "GrantMatch" }),
      /* @__PURE__ */ jsx(Link, { to: "/partner-match", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "Partner Match" }),
      /* @__PURE__ */ jsx(Link, { to: "/graph", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "Knowledge Graph" }),
      /* @__PURE__ */ jsx(Link, { to: "/map", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "Map" }),
      /* @__PURE__ */ jsx(Link, { to: "/pricing", className: "no-underline hover:underline", style: { color: "#6a6a6a" }, children: "Pricing" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3 text-sm", style: { color: "#6a6a6a" }, children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Data from",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://cordis.europa.eu/datalab",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "font-medium no-underline hover:underline",
            style: { color: "#ff385c" },
            children: "CORDIS EURIO Knowledge Graph"
          }
        ),
        " ",
        "· AI matching powered by Claude"
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " CORDIS Explorer"
      ] })
    ] })
  ] }) });
}
const HE_CLUSTERS = {
  "1": { label: "Health", short: "Health", color: "#f43f5e", patterns: ["HORIZON-HEALTH-", "HORIZON-CL1-"] },
  "2": { label: "Culture, Creativity & Inclusive Society", short: "Culture", color: "#8b5cf6", patterns: ["HORIZON-CL2-"] },
  "3": { label: "Civil Security for Society", short: "Security", color: "#6366f1", patterns: ["HORIZON-CL3-"] },
  "4": { label: "Digital, Industry & Space", short: "Digital", color: "#06b6d4", patterns: ["HORIZON-CL4-"] },
  "5": { label: "Climate, Energy & Mobility", short: "Climate", color: "#10b981", patterns: ["HORIZON-CL5-"] },
  "6": { label: "Food, Bioeconomy, Natural Resources & Environment", short: "Food & Env", color: "#f59e0b", patterns: ["HORIZON-CL6-"] }
};
const JU_TOPIC_PATTERNS = {
  "CBE JU": ["JU-CBE"],
  "Chips JU": ["JU-CHIPS"],
  "Clean Aviation JU": ["JU-CLEAN-AVIATION"],
  "Clean Hydrogen JU": ["FCH-JU", "JTI-FCH"],
  // FCH-JU-* (FP7/H2020), H2020-JTI-FCH-*
  "ECSEL JU": ["ECSEL"],
  // H2020 era (predecessor to KDT JU)
  "Europe's Rail JU": ["ER-JU", "JU-ER", "S2RJU"],
  // HORIZON-ER-JU, HORIZON-JU-ER, H2020-S2RJU
  "EuroHPC JU": ["EUROHPC-JU", "JU-EUROHPC"],
  "Global Health EDCTP3 JU": ["EDCTP3"],
  "IHI JU": ["JU-IHI"],
  // HE era (Innovative Health Initiative)
  "IMI JU": ["JTI-IMI"],
  // H2020 era (Innovative Medicines Initiative)
  "KDT JU": ["KDT-JU"],
  "SESAR 3 JU": ["HORIZON-SESAR"],
  // HE era SESAR
  "SNS JU": ["JU-SNS"]
};
function juNameFromLabel(label) {
  const upper = label.toUpperCase();
  for (const [name, patterns] of Object.entries(JU_TOPIC_PATTERNS)) {
    if (patterns.some((p) => upper.includes(p.toUpperCase()))) return name;
  }
  return void 0;
}
function escapeString(str) {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
function buildProjectSearchQuery(filters) {
  const offset = (filters.page - 1) * filters.pageSize;
  const limit = filters.pageSize;
  const whereClauses = [
    "?project a eurio:Project .",
    "?project eurio:title ?title .",
    "OPTIONAL { ?project eurio:acronym ?acronym }",
    "OPTIONAL { ?project eurio:endDate ?endDate }",
    "OPTIONAL { ?project eurio:identifier ?identifier }"
  ];
  if (filters.programme) {
    whereClauses.push("?project eurio:startDate ?startDate .");
  } else {
    whereClauses.push("OPTIONAL { ?project eurio:startDate ?startDate }");
  }
  if (filters.keyword) {
    const term = escapeString(filters.keyword.toLowerCase());
    whereClauses.push("OPTIONAL { ?project eurio:objective ?objective }");
    whereClauses.push(
      `FILTER(CONTAINS(LCASE(?title), '${term}') || CONTAINS(LCASE(COALESCE(?objective, "")), '${term}'))`
    );
  }
  if (filters.country) {
    const country = escapeString(filters.country);
    whereClauses.push(
      "?project eurio:hasInvolvedParty ?countryRole .",
      "?countryRole eurio:isRoleOf ?countryOrg .",
      "?countryOrg eurio:hasSite ?countrySite .",
      "?countrySite eurio:hasGeographicalLocation ?filterCountry .",
      "?filterCountry a eurio:Country .",
      `?filterCountry eurio:name '${country}' .`
    );
  }
  if (filters.organisation) {
    const orgTerm = escapeString(filters.organisation.toUpperCase());
    whereClauses.push(
      "?project eurio:hasInvolvedParty ?orgRole .",
      "?orgRole eurio:isRoleOf ?filterOrg .",
      "?filterOrg eurio:legalName ?filterOrgName .",
      `FILTER(CONTAINS(UCASE(?filterOrgName), '${orgTerm}'))`
    );
  }
  if (filters.euroSciVoc) {
    const esv = escapeString(filters.euroSciVoc);
    whereClauses.push(
      "?project eurio:hasEuroSciVocClassification ?esv .",
      "?esv skos-xl:prefLabel ?esvLabel .",
      `?esvLabel skos-xl:literalForm '${esv}'@en .`
    );
  }
  if (filters.startDateFrom) {
    whereClauses.push(
      `FILTER(?startDate >= "${filters.startDateFrom}"^^xsd:date)`
    );
  }
  if (filters.startDateTo) {
    whereClauses.push(
      `FILTER(?startDate <= "${filters.startDateTo}"^^xsd:date)`
    );
  }
  if (filters.programme) {
    if (filters.programme === "FP7") {
      whereClauses.push('FILTER(?startDate < "2014-01-01"^^xsd:date)');
    } else if (filters.programme === "H2020") {
      whereClauses.push('FILTER(?startDate >= "2014-01-01"^^xsd:date && ?startDate < "2021-01-01"^^xsd:date)');
    } else if (filters.programme === "HE") {
      whereClauses.push('FILTER(?startDate >= "2021-01-01"^^xsd:date)');
    }
  }
  if (filters.managingInstitution) {
    const patterns = JU_TOPIC_PATTERNS[filters.managingInstitution] ?? [escapeString(filters.managingInstitution.toUpperCase())];
    const filterExpr = patterns.map((p) => `CONTAINS(UCASE(?instTopicLabel), '${escapeString(p.toUpperCase())}')`).join(" || ");
    whereClauses.push(
      "?project eurio:isFundedBy ?instGrant .",
      "{ ?instGrant eurio:hasFundingSchemeTopic ?instTopic . } UNION { ?instGrant eurio:hasFundingSchemeCall ?instTopic . }",
      "?instTopic rdfs:label ?instTopicLabel .",
      `FILTER(${filterExpr})`
    );
  }
  if (filters.cluster && HE_CLUSTERS[filters.cluster]) {
    const clusterPatterns = HE_CLUSTERS[filters.cluster].patterns;
    const clusterFilterExpr = clusterPatterns.map((p) => `CONTAINS(UCASE(?clusterTopicLabel), '${escapeString(p.toUpperCase())}')`).join(" || ");
    whereClauses.push(
      "?project eurio:isFundedBy ?clusterGrant .",
      "{ ?clusterGrant eurio:hasFundingSchemeTopic ?clusterTopic . } UNION { ?clusterGrant eurio:hasFundingSchemeCall ?clusterTopic . }",
      "?clusterTopic rdfs:label ?clusterTopicLabel .",
      `FILTER(${clusterFilterExpr})`
    );
  }
  if (filters.actionType) {
    const at = escapeString(filters.actionType.toUpperCase());
    whereClauses.push(
      "?project eurio:isFundedBy ?atGrant .",
      "{ ?atGrant eurio:hasFundingSchemeTopic ?atTopic . } UNION { ?atGrant eurio:hasFundingSchemeCall ?atTopic . }",
      "?atTopic rdfs:label ?atTopicLabel .",
      `FILTER(CONTAINS(UCASE(?atTopicLabel), '-${at}-') || REGEX(UCASE(?atTopicLabel), '-${at}$'))`
    );
  }
  if (filters.trlMin != null || filters.trlMax != null) {
    whereClauses.push(
      "OPTIONAL { ?project eurio:isFundedBy ?trlGrant . ?trlGrant eurio:minTrl ?minTrl . }",
      "OPTIONAL { ?project eurio:isFundedBy ?trlGrant2 . ?trlGrant2 eurio:maxTrl ?maxTrl . }"
    );
    if (filters.trlMin != null) {
      whereClauses.push(`FILTER(!BOUND(?maxTrl) || ?maxTrl >= ${filters.trlMin})`);
    }
    if (filters.trlMax != null) {
      whereClauses.push(`FILTER(!BOUND(?minTrl) || ?minTrl <= ${filters.trlMax})`);
    }
  }
  whereClauses.push(
    "OPTIONAL {",
    "  ?project eurio:isFundedBy ?_tGrant .",
    "  { ?_tGrant eurio:hasFundingSchemeTopic ?_tTopic . } UNION { ?_tGrant eurio:hasFundingSchemeCall ?_tTopic . }",
    "  ?_tTopic rdfs:label ?topicLabel .",
    "  FILTER(!CONTAINS(?topicLabel, ' '))",
    "}",
    // Keep JU label separately for managingInstitution badge detection
    "OPTIONAL {",
    "  ?project eurio:isFundedBy ?_juGrant .",
    "  { ?_juGrant eurio:hasFundingSchemeTopic ?_juTopic . } UNION { ?_juGrant eurio:hasFundingSchemeCall ?_juTopic . }",
    "  ?_juTopic rdfs:label ?juLabel .",
    "  FILTER(CONTAINS(UCASE(?juLabel), 'JU-') || CONTAINS(UCASE(?juLabel), '-JU') || CONTAINS(UCASE(?juLabel), 'HORIZON-SESAR') || CONTAINS(UCASE(?juLabel), 'ECSEL') || CONTAINS(UCASE(?juLabel), 'JTI-IMI'))",
    "}"
  );
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos-xl: <http://www.w3.org/2008/05/skos-xl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?project ?title ?acronym ?startDate ?endDate ?identifier ?topicLabel ?juLabel
WHERE {
  ${whereClauses.join("\n  ")}
}
ORDER BY DESC(?startDate)
LIMIT ${limit}
OFFSET ${offset}
  `.trim();
}
function buildProjectDetailQuery(projectId) {
  const id = escapeString(projectId);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?title ?acronym ?identifier ?startDate ?endDate ?abstract ?keyword
       ?orgName ?roleLabel ?countryName
WHERE {
  ?project eurio:identifier '${id}' .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?project eurio:endDate ?endDate }
  OPTIONAL { ?project eurio:abstract ?abstract }
  OPTIONAL { ?project eurio:keyword ?keyword }

  OPTIONAL {
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:roleLabel ?roleLabel .
    ?role eurio:isRoleOf ?org .
    ?org eurio:legalName ?orgName .
    OPTIONAL {
      ?org eurio:hasSite ?site .
      ?site eurio:hasGeographicalLocation ?country .
      ?country a eurio:Country .
      ?country eurio:name ?countryName .
    }
  }
}
  `.trim();
}
function buildPublicationsQuery(projectId) {
  const id = escapeString(projectId);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?pubTitle ?doi ?authors ?publisher
WHERE {
  ?project eurio:identifier '${id}' .
  ?project eurio:hasResult ?result .
  ?result a eurio:ProjectPublication .
  OPTIONAL { ?result eurio:title ?pubTitle }
  OPTIONAL { ?result eurio:doi ?doi }
  OPTIONAL { ?result eurio:author ?authors }
  OPTIONAL { ?result eurio:publisher ?publisher }
}
  `.trim();
}
function buildCountriesQuery() {
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?countryName
WHERE {
  ?country a eurio:Country .
  ?country eurio:name ?countryName .
}
ORDER BY ?countryName
  `.trim();
}
function buildEuroSciVocQuery() {
  return `
PREFIX skos-xl: <http://www.w3.org/2008/05/skos-xl#>

SELECT DISTINCT ?label
WHERE {
  ?concept a skos-xl:Label .
  ?concept skos-xl:literalForm ?label .
  FILTER(LANG(?label) = 'en')
}
ORDER BY ?label
LIMIT 2000
  `.trim();
}
function buildMapDataQuery(programme) {
  let progFilter = "";
  if (programme === "HE") {
    progFilter = `?project eurio:startDate ?_sd . FILTER(?_sd >= "2021-01-01"^^xsd:date)`;
  } else if (programme === "H2020") {
    progFilter = `?project eurio:startDate ?_sd . FILTER(?_sd >= "2014-01-01"^^xsd:date && ?_sd < "2021-01-01"^^xsd:date)`;
  } else if (programme === "FP7") {
    progFilter = `?project eurio:startDate ?_sd . FILTER(?_sd < "2014-01-01"^^xsd:date)`;
  }
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryName (COUNT(DISTINCT ?project) AS ?projectCount) (COUNT(DISTINCT ?org) AS ?orgCount)
WHERE {
  ?project a eurio:Project .
  ${progFilter}
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:hasSite ?site .
  ?site eurio:hasGeographicalLocation ?country .
  ?country a eurio:Country .
  ?country eurio:name ?countryName .
}
GROUP BY ?countryName
ORDER BY DESC(?projectCount)
  `.trim();
}
function buildOrgSearchForGraphQuery(searchTerm) {
  const term = escapeString(searchTerm.toUpperCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?orgName (COUNT(DISTINCT ?project) AS ?projectCount)
WHERE {
  ?org eurio:legalName ?orgName .
  FILTER(CONTAINS(UCASE(?orgName), '${term}'))
  OPTIONAL {
    ?project a eurio:Project .
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:isRoleOf ?org .
  }
}
GROUP BY ?orgName
ORDER BY DESC(?projectCount)
LIMIT 8
  `.trim();
}
function buildOrgProjectsForGraphQuery(orgName) {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?projectTitle ?projectAcronym ?projectId ?startDate
WHERE {
  ?org eurio:legalName '${name}' .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?project a eurio:Project .
  ?project eurio:title ?projectTitle .
  OPTIONAL { ?project eurio:acronym ?projectAcronym }
  OPTIONAL { ?project eurio:identifier ?projectId }
  OPTIONAL { ?project eurio:startDate ?startDate }
}
ORDER BY DESC(?startDate)
LIMIT 12
  `.trim();
}
function buildCountryOrgsForGraphQuery(countryName) {
  const name = escapeString(countryName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?orgName (COUNT(DISTINCT ?project) AS ?projectCount)
WHERE {
  ?country a eurio:Country .
  ?country eurio:name '${name}' .
  ?org eurio:hasSite ?site .
  ?site eurio:hasGeographicalLocation ?country .
  ?org eurio:legalName ?orgName .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
}
GROUP BY ?orgName
ORDER BY DESC(?projectCount)
LIMIT 15
  `.trim();
}
function buildProjectParticipantsForGraphQuery(projectId) {
  const id = escapeString(projectId);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?orgName ?countryName ?roleLabel
WHERE {
  ?project eurio:identifier '${id}' .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  OPTIONAL { ?role eurio:roleLabel ?roleLabel }
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
LIMIT 25
  `.trim();
}
function buildProjectSearchForGraphQuery(searchTerm) {
  const term = escapeString(searchTerm.toUpperCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?projectTitle ?projectAcronym ?projectId
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?projectTitle .
  OPTIONAL { ?project eurio:acronym ?projectAcronym }
  OPTIONAL { ?project eurio:identifier ?projectId }
  FILTER(CONTAINS(UCASE(?projectTitle), '${term}') || CONTAINS(UCASE(COALESCE(?projectAcronym, '')), '${term}'))
}
ORDER BY ?projectTitle
LIMIT 8
  `.trim();
}
function buildOrgSummaryQuery(orgName) {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryName
       (COUNT(DISTINCT ?project) AS ?projectCount)
WHERE {
  ?org eurio:legalName '${name}' .
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
  OPTIONAL {
    ?project a eurio:Project .
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:isRoleOf ?org .
  }
}
GROUP BY ?countryName
  `.trim();
}
function buildOrgProjectsQuery(orgName) {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?title ?acronym ?identifier ?startDate ?roleLabel
WHERE {
  ?org eurio:legalName '${name}' .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:identifier ?identifier }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?role eurio:roleLabel ?roleLabel }
}
ORDER BY DESC(?startDate)
LIMIT 20
  `.trim();
}
function buildMscaProjectSearchQuery(keyword, mscaType, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const kwFilter = keyword ? `FILTER(CONTAINS(LCASE(?title), '${escapeString(keyword.toLowerCase())}') || CONTAINS(LCASE(COALESCE(?objective,"")), '${escapeString(keyword.toLowerCase())}'))` : "";
  const typeFilter = mscaType && mscaType !== "all" ? `FILTER(CONTAINS(UCASE(?mscaLabel), '-${escapeString(mscaType.toUpperCase())}-') || REGEX(UCASE(?mscaLabel), '-${escapeString(mscaType.toUpperCase())}$'))` : "";
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?project ?title ?acronym ?identifier ?startDate ?mscaLabel ?countryName
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:identifier ?identifier }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?project eurio:objective ?objective }

  ?project eurio:isFundedBy ?mscaGrant .
  { ?mscaGrant eurio:hasFundingSchemeTopic ?mscaTopic . } UNION { ?mscaGrant eurio:hasFundingSchemeCall ?mscaTopic . }
  ?mscaTopic rdfs:label ?mscaLabel .
  FILTER(
    CONTAINS(UCASE(?mscaLabel), 'MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE-CURIE') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE CURIE') ||
    CONTAINS(UCASE(?mscaLabel), 'H2020-MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'FP7-PEOPLE')
  )
  ${typeFilter}

  OPTIONAL {
    ?project eurio:hasInvolvedParty ?coordRole .
    ?coordRole eurio:roleLabel ?rl .
    FILTER(CONTAINS(UCASE(?rl), 'COORDINATOR'))
    ?coordRole eurio:isRoleOf ?coordOrg .
    ?coordOrg eurio:hasSite ?coordSite .
    ?coordSite eurio:hasGeographicalLocation ?coordCountry .
    ?coordCountry a eurio:Country .
    ?coordCountry eurio:name ?countryName .
  }

  ${kwFilter}
}
ORDER BY DESC(?startDate)
LIMIT ${pageSize}
OFFSET ${offset}
  `.trim();
}
function buildMscaSupervisorSearchQuery(researchArea) {
  const area = escapeString(researchArea.toLowerCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?orgName ?countryName (COUNT(DISTINCT ?project) AS ?mscaProjectCount)
       (GROUP_CONCAT(DISTINCT ?title; SEPARATOR="||") AS ?projectTitles)
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  FILTER(CONTAINS(LCASE(?title), '${area}'))

  ?project eurio:isFundedBy ?mscaGrant .
  { ?mscaGrant eurio:hasFundingSchemeTopic ?mscaTopic . } UNION { ?mscaGrant eurio:hasFundingSchemeCall ?mscaTopic . }
  ?mscaTopic rdfs:label ?mscaLabel .
  FILTER(
    CONTAINS(UCASE(?mscaLabel), 'MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE') ||
    CONTAINS(UCASE(?mscaLabel), 'FP7-PEOPLE')
  )

  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
GROUP BY ?orgName ?countryName
ORDER BY DESC(?mscaProjectCount)
LIMIT 20
  `.trim();
}
function buildOrgCoApplicantsQuery(orgName) {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?coOrgName (COUNT(DISTINCT ?project) AS ?sharedCount)
WHERE {
  ?org eurio:legalName '${name}' .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role1 .
  ?role1 eurio:isRoleOf ?org .
  ?project eurio:hasInvolvedParty ?role2 .
  ?role2 eurio:isRoleOf ?coOrg .
  ?coOrg eurio:legalName ?coOrgName .
  FILTER(?coOrgName != '${name}')
}
GROUP BY ?coOrgName
ORDER BY DESC(?sharedCount)
LIMIT 10
  `.trim();
}
async function executeSparql(query) {
  const response = await fetch("/api/sparql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `SPARQL query failed: ${response.status}`);
  }
  return response.json();
}
function getValue(binding, key) {
  var _a;
  return (_a = binding[key]) == null ? void 0 : _a.value;
}
function detectProgramme$1(identifier, startDate) {
  if (!identifier && !startDate) return void 0;
  if (startDate) {
    const year = new Date(startDate).getFullYear();
    if (year < 2014) return "FP7";
    if (year < 2021) return "H2020";
    return "HE";
  }
  return void 0;
}
function parseProjectSummaries(data) {
  const projectMap = /* @__PURE__ */ new Map();
  for (const binding of data.results.bindings) {
    const uri = getValue(binding, "project") || "";
    const existing = projectMap.get(uri);
    if (!existing) {
      const startDate = getValue(binding, "startDate");
      const identifier = getValue(binding, "identifier");
      const juLabel = getValue(binding, "juLabel");
      const topicLabel = getValue(binding, "topicLabel");
      projectMap.set(uri, {
        uri,
        title: getValue(binding, "title") || "Untitled",
        acronym: getValue(binding, "acronym"),
        identifier,
        startDate,
        endDate: getValue(binding, "endDate"),
        programme: detectProgramme$1(identifier, startDate),
        countries: [],
        managingInstitution: juLabel ? juNameFromLabel(juLabel) : void 0,
        topicLabel
      });
    }
    const country = getValue(binding, "countryName");
    const project = projectMap.get(uri);
    if (country && !project.countries.includes(country)) {
      project.countries.push(country);
    }
    if (!project.topicLabel) {
      const tl = getValue(binding, "topicLabel");
      if (tl) project.topicLabel = tl;
    }
  }
  return Array.from(projectMap.values());
}
function parseProjectDetail(data) {
  var _a;
  const bindings = data.results.bindings;
  if (bindings.length === 0) return null;
  const first = bindings[0];
  const startDate = getValue(first, "startDate");
  const identifier = getValue(first, "identifier");
  const participantMap = /* @__PURE__ */ new Map();
  const countries = [];
  const keywords = [];
  for (const binding of bindings) {
    const orgName = getValue(binding, "orgName");
    const role = getValue(binding, "roleLabel") || "participant";
    const country = getValue(binding, "countryName") || "";
    const keyword = getValue(binding, "keyword");
    if (orgName && !participantMap.has(orgName)) {
      participantMap.set(orgName, { orgName, role, country });
    }
    if (country && !countries.includes(country)) {
      countries.push(country);
    }
    if (keyword && !keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  const participants = Array.from(participantMap.values()).sort((a, b) => {
    if (a.role.toLowerCase().includes("coordinator")) return -1;
    if (b.role.toLowerCase().includes("coordinator")) return 1;
    return a.orgName.localeCompare(b.orgName);
  });
  return {
    uri: "",
    title: getValue(first, "title") || "Untitled",
    acronym: getValue(first, "acronym"),
    identifier,
    startDate,
    endDate: getValue(first, "endDate"),
    abstract: getValue(first, "abstract"),
    keywords: keywords.length > 0 ? keywords : void 0,
    programme: detectProgramme$1(identifier, startDate),
    coordinator: (_a = participants.find((p) => p.role.toLowerCase().includes("coordinator"))) == null ? void 0 : _a.orgName,
    countries,
    participants
  };
}
function parsePublications(data) {
  return data.results.bindings.map((binding) => ({
    title: getValue(binding, "pubTitle"),
    doi: getValue(binding, "doi"),
    authors: getValue(binding, "authors"),
    publisher: getValue(binding, "publisher")
  }));
}
function parseStringList(data, key) {
  return data.results.bindings.map((binding) => getValue(binding, key)).filter((v) => !!v).sort();
}
const ACCENT_COLORS = ["#ff385c", "#2563eb", "#16a34a", "#d97706", "#7c3aed"];
function detectProgramme(startDate) {
  if (!startDate) return void 0;
  const year = new Date(startDate).getFullYear();
  if (year >= 2021) return "HE";
  if (year >= 2014) return "H2020";
  return "FP7";
}
function useLatestProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    executeSparql(`
PREFIX eurio: <http://data.europa.eu/s66#>
SELECT DISTINCT ?projectId ?projectTitle ?projectAcronym ?startDate
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?projectTitle .
  OPTIONAL { ?project eurio:acronym ?projectAcronym }
  OPTIONAL { ?project eurio:identifier ?projectId }
  OPTIONAL { ?project eurio:startDate ?startDate }
}
ORDER BY DESC(?startDate)
LIMIT 5`.trim()).then((data) => {
      const rows = data.results.bindings.map((b) => {
        var _a, _b, _c, _d, _e;
        return {
          id: ((_a = b.projectId) == null ? void 0 : _a.value) ?? "",
          title: ((_b = b.projectTitle) == null ? void 0 : _b.value) ?? "",
          acronym: (_c = b.projectAcronym) == null ? void 0 : _c.value,
          startDate: (_d = b.startDate) == null ? void 0 : _d.value,
          programme: detectProgramme((_e = b.startDate) == null ? void 0 : _e.value)
        };
      }).filter((r) => r.title);
      setProjects(rows);
    }).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  return { projects, loading };
}
const TOOLS = [
  {
    requiresAuth: true,
    to: "/grant-search",
    icon: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: [
      /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-4.35-4.35" })
    ] }),
    label: "Grant Search",
    description: "Describe your work. Get ranked EU funding calls in seconds."
  },
  {
    requiresAuth: true,
    to: "/profile-match",
    icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" }) }),
    label: "Profile Match",
    description: "Build a full org profile and find best-fit EU calls."
  },
  {
    requiresAuth: true,
    to: "/grant-match",
    badge: "NEW",
    icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" }) }),
    label: "GrantMatch",
    description: "Step-by-step wizard with sector, stage & R&D filters."
  },
  {
    to: "/search",
    icon: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" })
    ] }),
    label: "Browse CORDIS",
    description: "Explore 50,000+ funded EU research projects."
  },
  {
    requiresAuth: true,
    to: "/partner-match",
    icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
    label: "Partner Match",
    description: "Find ideal EU consortium partners using AI."
  },
  {
    requiresAuth: true,
    to: "/partner-search",
    icon: "🤝",
    label: "Partner Search Hub",
    description: "Find organisations actively seeking EU research partners via the F&T Portal, enriched with their CORDIS track record."
  },
  {
    to: "/events",
    icon: "📅",
    label: "Brokerage Events",
    description: "Find EU research networking and matchmaking events from the Enterprise Europe Network, filterable by cluster and country."
  },
  {
    to: "/graph",
    icon: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: [
      /* @__PURE__ */ jsx("circle", { cx: "5", cy: "12", r: "2.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "19", cy: "6", r: "2.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "19", cy: "18", r: "2.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "2.5" }),
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M7.5 12h2M14.5 12h2M17 7.5l-3 3M17 16.5l-3-3" })
    ] }),
    label: "Knowledge Graph",
    description: "Explore the EURIO knowledge graph — organisations, projects, countries."
  },
  {
    to: "/map",
    icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" }) }),
    label: "Geographic Map",
    description: "See EU project distribution across countries on an interactive map."
  },
  {
    to: "/msca",
    icon: "🎓",
    label: "MSCA Explorer",
    description: "Search Marie Skłodowska-Curie Actions projects and discover host organisations for fellowships and doctoral networks."
  }
];
const EU_COUNTRIES = [
  // Norway (W coast + N cape + E border with Sweden)
  {
    id: "no",
    d: "M214,184 L214,132 L270,52 L378,13 L320,46 L271,92 L263,169 L232,186 Z",
    fill: "rgba(37,99,235,0.14)",
    stroke: "rgba(37,99,235,0.6)"
  },
  // Sweden (E of Norway border, W of Finland)
  {
    id: "se",
    d: "M263,169 L271,92 L320,46 L320,92 L310,211 L270,211 L253,211 L232,186 Z",
    fill: "rgba(37,99,235,0.08)",
    stroke: "rgba(37,99,235,0.45)"
  },
  // Finland
  {
    id: "fi",
    d: "M320,46 L385,33 L399,131 L378,151 L357,163 L334,165 L320,92 Z",
    fill: "rgba(22,163,74,0.14)",
    stroke: "rgba(22,163,74,0.55)"
  },
  // Denmark (Jutland + islands rough)
  {
    id: "dk",
    d: "M232,186 L253,186 L253,211 L270,211 L253,219 L232,214 Z",
    fill: "rgba(255,56,92,0.16)",
    stroke: "rgba(255,56,92,0.6)"
  },
  // Baltic States (Estonia + Latvia + Lithuania)
  {
    id: "balt",
    d: "M310,211 L320,92 L334,165 L357,163 L378,151 L385,184 L370,204 L344,214 L327,225 Z",
    fill: "rgba(37,99,235,0.1)",
    stroke: "rgba(37,99,235,0.42)"
  },
  // UK (Great Britain, simplified)
  {
    id: "uk",
    d: "M153,176 L163,196 L168,223 L183,272 L160,274 L135,290 L139,264 L142,211 Z",
    fill: "rgba(37,99,235,0.14)",
    stroke: "rgba(37,99,235,0.6)"
  },
  // Ireland
  {
    id: "ie",
    d: "M119,248 L143,237 L149,256 L137,267 L116,263 Z",
    fill: "rgba(22,163,74,0.14)",
    stroke: "rgba(22,163,74,0.55)"
  },
  // France
  {
    id: "fr",
    d: "M191,277 L222,293 L233,316 L232,323 L231,372 L199,389 L165,376 L159,329 L143,316 L167,296 Z",
    fill: "rgba(255,56,92,0.14)",
    stroke: "rgba(255,56,92,0.6)"
  },
  // Spain + Portugal (Iberian Peninsula)
  {
    id: "es",
    d: "M131,371 L165,373 L201,388 L178,421 L160,462 L138,473 L114,461 L110,440 L114,397 L131,395 Z",
    fill: "rgba(255,56,92,0.12)",
    stroke: "rgba(255,56,92,0.52)"
  },
  // Germany
  {
    id: "de",
    d: "M228,242 L245,225 L280,233 L284,258 L285,277 L274,313 L249,322 L232,322 L233,309 L221,280 Z",
    fill: "rgba(37,99,235,0.16)",
    stroke: "rgba(37,99,235,0.65)"
  },
  // Benelux (Netherlands + Belgium)
  {
    id: "benl",
    d: "M198,296 L222,293 L228,242 L211,250 L191,277 Z",
    fill: "rgba(215,119,6,0.16)",
    stroke: "rgba(215,119,6,0.6)"
  },
  // Switzerland + Austria
  {
    id: "chau",
    d: "M221,317 L232,322 L249,322 L274,313 L295,314 L295,336 L248,336 L221,336 Z",
    fill: "rgba(124,58,237,0.14)",
    stroke: "rgba(124,58,237,0.55)"
  },
  // Italy (boot)
  {
    id: "it",
    d: "M231,372 L279,347 L276,374 L299,407 L307,413 L287,447 L270,430 L267,395 L251,374 Z",
    fill: "rgba(22,163,74,0.14)",
    stroke: "rgba(22,163,74,0.55)"
  },
  // Poland
  {
    id: "pl",
    d: "M279,230 L309,229 L344,214 L327,225 L349,283 L341,291 L307,293 L285,283 L279,264 Z",
    fill: "rgba(255,56,92,0.12)",
    stroke: "rgba(255,56,92,0.5)"
  },
  // Czech Republic
  {
    id: "cz",
    d: "M267,277 L285,277 L285,283 L310,278 L310,305 L265,309 Z",
    fill: "rgba(215,119,6,0.14)",
    stroke: "rgba(215,119,6,0.55)"
  },
  // Slovakia + Hungary
  {
    id: "husk",
    d: "M295,314 L310,305 L341,291 L341,342 L303,345 L295,336 Z",
    fill: "rgba(215,119,6,0.12)",
    stroke: "rgba(215,119,6,0.5)"
  },
  // Romania
  {
    id: "ro",
    d: "M341,291 L349,283 L388,315 L385,350 L381,370 L352,373 L334,363 L334,318 L341,305 Z",
    fill: "rgba(22,163,74,0.12)",
    stroke: "rgba(22,163,74,0.5)"
  },
  // Western Balkans (Croatia, Serbia, Bosnia)
  {
    id: "balk",
    d: "M257,336 L295,336 L303,345 L341,342 L334,363 L320,375 L300,385 L266,380 L248,356 Z",
    fill: "rgba(124,58,237,0.12)",
    stroke: "rgba(124,58,237,0.48)"
  },
  // Bulgaria
  {
    id: "bg",
    d: "M334,363 L381,370 L381,396 L334,396 Z",
    fill: "rgba(37,99,235,0.12)",
    stroke: "rgba(37,99,235,0.5)"
  },
  // Greece
  {
    id: "gr",
    d: "M300,385 L320,375 L334,396 L381,396 L362,421 L348,447 L334,463 L322,445 L300,410 Z",
    fill: "rgba(37,99,235,0.14)",
    stroke: "rgba(37,99,235,0.58)"
  }
];
const EU_CITIES = [
  { id: "dublin", x: 133, y: 247, color: "#16a34a", r: 3.5 },
  { id: "london", x: 178, y: 270, color: "#ff385c", r: 5 },
  { id: "paris", x: 196, y: 305, color: "#ff385c", r: 6 },
  { id: "berlin", x: 273, y: 257, color: "#2563eb", r: 6 },
  { id: "amsterdam", x: 213, y: 257, color: "#d97706", r: 3.5 },
  { id: "brussels", x: 209, y: 279, color: "#d97706", r: 3.5 },
  { id: "madrid", x: 151, y: 418, color: "#ff385c", r: 4 },
  { id: "rome", x: 267, y: 395, color: "#16a34a", r: 5 },
  { id: "vienna", x: 295, y: 314, color: "#7c3aed", r: 3.5 },
  { id: "warsaw", x: 327, y: 261, color: "#ff385c", r: 4 },
  { id: "stockholm", x: 308, y: 174, color: "#2563eb", r: 5 },
  { id: "helsinki", x: 357, y: 157, color: "#16a34a", r: 3.5 },
  { id: "prague", x: 281, y: 286, color: "#d97706", r: 3.5 },
  { id: "copenhagen", x: 268, y: 214, color: "#2563eb", r: 3.5 },
  { id: "athens", x: 348, y: 447, color: "#2563eb", r: 4 },
  { id: "bucharest", x: 362, y: 365, color: "#16a34a", r: 3.5 }
];
const EU_ARCS = [
  { id: "ar1", d: "M178,270 Q187,286 196,305", color: "#ff385c", dur: "2.8s", begin: "0s" },
  { id: "ar2", d: "M196,305 Q202,290 209,279", color: "#ff385c", dur: "1.8s", begin: "-0.9s" },
  { id: "ar3", d: "M196,305 Q234,275 273,257", color: "#ff385c", dur: "3.5s", begin: "-1.5s" },
  { id: "ar4", d: "M273,257 Q300,255 327,261", color: "#2563eb", dur: "2.5s", begin: "-0.8s" },
  { id: "ar5", d: "M273,257 Q277,270 281,286", color: "#2563eb", dur: "1.5s", begin: "-0.3s" },
  { id: "ar6", d: "M281,286 Q288,300 295,314", color: "#7c3aed", dur: "1.5s", begin: "-0.7s" },
  { id: "ar7", d: "M295,314 Q280,355 267,395", color: "#16a34a", dur: "3.2s", begin: "-1.2s" },
  { id: "ar8", d: "M308,174 Q333,165 357,157", color: "#2563eb", dur: "2.2s", begin: "-1.0s" },
  { id: "ar9", d: "M308,174 Q288,194 268,214", color: "#2563eb", dur: "2.0s", begin: "-0.5s" },
  { id: "ar10", d: "M151,418 Q174,362 196,305", color: "#ff385c", dur: "4.0s", begin: "-2.0s" },
  { id: "ar11", d: "M267,395 Q307,421 348,447", color: "#16a34a", dur: "3.5s", begin: "-1.8s" },
  { id: "ar12", d: "M327,261 Q345,313 362,365", color: "#ff385c", dur: "3.8s", begin: "-2.1s" },
  { id: "ar13", d: "M209,279 Q211,268 213,257", color: "#d97706", dur: "1.5s", begin: "-0.4s" },
  { id: "ar14", d: "M178,270 Q155,259 133,247", color: "#ff385c", dur: "2.0s", begin: "-1.0s" }
];
function EuropeMapAnimation() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 500 500", className: "w-full h-full", fill: "none", role: "img", "aria-label": "Animated map of EU research collaboration network showing connections between major European cities", children: [
    /* @__PURE__ */ jsx("defs", { children: EU_ARCS.map((a) => /* @__PURE__ */ jsx("path", { id: a.id, d: a.d }, a.id)) }),
    EU_COUNTRIES.map((c) => /* @__PURE__ */ jsx("path", { d: c.d, fill: c.fill, stroke: c.stroke, strokeWidth: "1", strokeLinejoin: "round" }, c.id)),
    EU_ARCS.map((a) => /* @__PURE__ */ jsx(
      "path",
      {
        d: a.d,
        stroke: a.color,
        strokeWidth: "0.7",
        strokeOpacity: "0.22",
        strokeDasharray: "3 5"
      },
      `line-${a.id}`
    )),
    EU_CITIES.map((c, i) => /* @__PURE__ */ jsxs(
      "circle",
      {
        cx: c.x,
        cy: c.y,
        r: c.r + 6,
        fill: "none",
        stroke: c.color,
        strokeWidth: "0.8",
        strokeOpacity: "0.2",
        children: [
          /* @__PURE__ */ jsx(
            "animate",
            {
              attributeName: "r",
              values: `${c.r + 2};${c.r + 14};${c.r + 2}`,
              dur: `${2.4 + i * 0.14}s`,
              repeatCount: "indefinite"
            }
          ),
          /* @__PURE__ */ jsx(
            "animate",
            {
              attributeName: "stroke-opacity",
              values: "0.28;0;0.28",
              dur: `${2.4 + i * 0.14}s`,
              repeatCount: "indefinite"
            }
          )
        ]
      },
      `ring-${c.id}`
    )),
    EU_CITIES.map((c, i) => /* @__PURE__ */ jsx("circle", { cx: c.x, cy: c.y, r: c.r, fill: c.color, children: /* @__PURE__ */ jsx(
      "animate",
      {
        attributeName: "opacity",
        values: "0.7;1;0.7",
        dur: `${2 + i * 0.11}s`,
        repeatCount: "indefinite"
      }
    ) }, `dot-${c.id}`)),
    EU_ARCS.map((a) => /* @__PURE__ */ jsx("circle", { r: "2.2", fill: a.color, fillOpacity: "0.95", children: /* @__PURE__ */ jsx("animateMotion", { dur: a.dur, repeatCount: "indefinite", begin: a.begin, children: /* @__PURE__ */ jsx("mpath", { href: `#${a.id}` }) }) }, `t-${a.id}`))
  ] });
}
const PROGRAMME_STYLES = {
  HE: { bg: "rgba(16,185,129,0.10)", color: "#059669", border: "rgba(16,185,129,0.28)" },
  H2020: { bg: "rgba(37,99,235,0.10)", color: "#2563eb", border: "rgba(37,99,235,0.28)" },
  FP7: { bg: "rgba(124,58,237,0.10)", color: "#7c3aed", border: "rgba(124,58,237,0.28)" }
};
function LatestAdditions() {
  const { projects, loading } = useLatestProjects();
  return /* @__PURE__ */ jsx("section", { style: { borderTop: "1px solid #ebebeb" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-6 py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-1", style: { color: "#222222", letterSpacing: "-0.04em" }, children: "Latest additions to CORDIS" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "#6a6a6a" }, children: "Most recently started EU-funded research projects" })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/search",
          className: "text-xs font-semibold no-underline flex items-center gap-1",
          style: { color: "#ff385c" },
          children: "Browse all →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl overflow-hidden", style: { border: "1px solid #ebebeb", background: "#ffffff" }, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "grid px-5 py-3 text-[10px] font-bold uppercase tracking-widest",
          style: { color: "#aaaaaa", borderBottom: "1px solid #f2f2f2", gridTemplateColumns: "2fr 4fr 1.2fr 1.2fr" },
          children: [
            /* @__PURE__ */ jsx("span", { children: "Project" }),
            /* @__PURE__ */ jsx("span", { children: "Title" }),
            /* @__PURE__ */ jsx("span", { children: "Started" }),
            /* @__PURE__ */ jsx("span", { children: "Programme" })
          ]
        }
      ),
      loading ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "grid px-5 py-4 items-center animate-pulse",
          style: { gridTemplateColumns: "2fr 4fr 1.2fr 1.2fr", borderBottom: i < 4 ? "1px solid #f7f7f7" : "none" },
          children: [
            /* @__PURE__ */ jsx("div", { className: "h-4 rounded", style: { background: "#f2f2f2", width: "70%" } }),
            /* @__PURE__ */ jsx("div", { className: "h-4 rounded", style: { background: "#f2f2f2", width: "90%" } }),
            /* @__PURE__ */ jsx("div", { className: "h-4 rounded", style: { background: "#f2f2f2", width: "50%" } }),
            /* @__PURE__ */ jsx("div", { className: "h-4 rounded", style: { background: "#f2f2f2", width: "60%" } })
          ]
        },
        i
      )) : projects.map((p, i) => {
        const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
        const year = p.startDate ? new Date(p.startDate).getFullYear() : null;
        const progStyle = p.programme ? PROGRAMME_STYLES[p.programme] : null;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "grid px-5 py-4 items-center transition-colors",
            style: {
              gridTemplateColumns: "2fr 4fr 1.2fr 1.2fr",
              borderBottom: i < projects.length - 1 ? "1px solid #f7f7f7" : "none",
              borderLeft: `3px solid ${accent}`
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#fafafa";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "";
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0",
                    style: { background: `${accent}18`, color: accent },
                    children: (p.acronym ?? p.id ?? "?").slice(0, 3).toUpperCase()
                  }
                ),
                p.id ? /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `/project/${p.id}`,
                    className: "text-xs font-bold truncate no-underline hover:underline",
                    style: { color: accent },
                    children: p.acronym ?? p.id
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "text-xs font-bold truncate", style: { color: accent }, children: p.acronym ?? "—" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium truncate pr-4", style: { color: "#333333" }, children: p.title.length > 70 ? p.title.slice(0, 68) + "…" : p.title }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", style: { color: "#6a6a6a" }, children: year ?? "—" }),
              progStyle ? /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-flex items-center rounded-full text-[10px] font-bold px-2 py-0.5 w-fit",
                  style: { background: progStyle.bg, color: progStyle.color, border: `1px solid ${progStyle.border}` },
                  children: p.programme
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: "#cccccc" }, children: "—" })
            ]
          },
          p.id || i
        );
      })
    ] })
  ] }) });
}
function HomePage() {
  const { user, openAuthModal } = useAuth();
  const visibleTools = TOOLS;
  useEffect(() => {
    document.title = "CORDIS Explorer — Search EU-Funded Research Projects";
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "#ffffff" }, children: [
    /* @__PURE__ */ jsxs("section", { style: {
      position: "relative",
      height: "calc(100vh - 65px)",
      minHeight: 580,
      overflow: "hidden",
      background: "radial-gradient(ellipse at 58% 50%, rgba(255,56,92,0.14) 0%, transparent 58%), linear-gradient(155deg, #09000d 0%, #130008 55%, #07000a 100%)"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "64px 64px"
      } }),
      /* @__PURE__ */ jsxs("div", { style: {
        position: "absolute",
        top: "clamp(20px, 4vh, 48px)",
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 10,
        pointerEvents: "none"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(255,56,92,0.12)",
          border: "1px solid rgba(255,56,92,0.3)",
          borderRadius: 999,
          padding: "5px 14px",
          marginBottom: 14
        }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: 5, height: 5, borderRadius: "50%", background: "#ff385c", display: "inline-block" } }),
          /* @__PURE__ */ jsx("span", { style: { color: "#ff385c", fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }, children: "EU Research Intelligence" })
        ] }),
        /* @__PURE__ */ jsx("h1", { style: { lineHeight: 0.88, margin: 0 }, children: ["EU FUNDING", "DECODED."].map((word, i) => /* @__PURE__ */ jsx("span", { style: {
          display: "block",
          fontSize: "clamp(38px, 5.8vw, 90px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: i === 1 ? "#ff385c" : "white"
        }, children: word }, word)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: {
        position: "absolute",
        bottom: "clamp(24px, 4vh, 52px)",
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 10
      }, children: [
        /* @__PURE__ */ jsxs("h2", { style: {
          color: "white",
          fontSize: "clamp(18px, 2vw, 26px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: 10,
          textTransform: "uppercase"
        }, children: [
          "UNLOCK EU RESEARCH POTENTIAL",
          " ",
          /* @__PURE__ */ jsx("span", { style: { color: "#ff385c" }, children: "WITH AI." })
        ] }),
        /* @__PURE__ */ jsxs("p", { style: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }, children: [
          "From innovative",
          " ",
          /* @__PURE__ */ jsx("strong", { style: { color: "rgba(255,255,255,0.75)", fontWeight: 600 }, children: "grant matching" }),
          " ",
          "to network analysis — explore 50,000+ EU‑funded research projects."
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openAuthModal,
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ff385c",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 7,
              padding: "0 28px",
              height: 44,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: "inherit",
              transition: "background 0.2s, transform 0.1s"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#e00b41";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#ff385c";
            },
            onMouseDown: (e) => {
              e.currentTarget.style.transform = "scale(0.96)";
            },
            onMouseUp: (e) => {
              e.currentTarget.style.transform = "";
            },
            children: [
              "EXPLORE NOW",
              /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M7 17L17 7M17 7H7M17 7v10" }) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-42%, -50%)",
        width: "clamp(280px, 42vw, 520px)",
        height: "46%"
      }, children: /* @__PURE__ */ jsx(EuropeMapAnimation, {}) }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        bottom: -14,
        left: 0,
        right: 0,
        textAlign: "center",
        pointerEvents: "none",
        overflow: "hidden",
        fontSize: "clamp(60px, 16vw, 210px)",
        fontWeight: 900,
        letterSpacing: "-0.04em",
        lineHeight: 0.82,
        zIndex: 1,
        color: "transparent",
        userSelect: "none",
        ...{ WebkitTextStroke: "1px rgba(255,255,255,0.045)" }
      }, children: "CORDIS" })
    ] }),
    /* @__PURE__ */ jsx("section", { style: { borderBottom: "1px solid #ebebeb" }, children: /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center", children: [
      { v: "50,000+", l: "Funded projects" },
      { v: "€100B+", l: "Total funding" },
      { v: "27", l: "EU countries" },
      { v: "3", l: "Research programmes" }
    ].map((s) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mb-1", style: { color: "#222222", letterSpacing: "-0.04em" }, children: s.v }),
      /* @__PURE__ */ jsx("div", { className: "text-sm", style: { color: "#6a6a6a" }, children: s.l })
    ] }, s.l)) }) }),
    /* @__PURE__ */ jsxs("section", { className: "max-w-3xl mx-auto px-6 py-14", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", style: { color: "#222222", letterSpacing: "-0.04em" }, children: "What is CORDIS Explorer?" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm leading-relaxed space-y-3", style: { color: "#484848" }, children: [
        /* @__PURE__ */ jsx("p", { children: "CORDIS Explorer is an AI-powered search platform for EU-funded research projects. It connects to the official CORDIS EURIO Knowledge Graph maintained by the European Commission and makes it easy to search, filter, and analyse over 50,000 projects funded under Horizon Europe, Horizon 2020, and FP7 — representing more than €100 billion in public research funding." }),
        /* @__PURE__ */ jsx("p", { children: "Unlike the official CORDIS portal, CORDIS Explorer adds intelligent grant matching: describe your research in plain language and the AI ranks the most relevant open EU funding calls for your organisation. The Partner Match tool identifies potential consortium partners based on complementary expertise and past project participation across 27 EU member states." }),
        /* @__PURE__ */ jsx("p", { children: "The platform also features an interactive Knowledge Graph explorer for visualising relationships between organisations, projects, and research topics, as well as a geographic map showing how EU research funding is distributed across Europe." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "max-w-5xl mx-auto px-6 py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-1.5", style: { color: "#222222", letterSpacing: "-0.04em" }, children: "Explore our tools" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "#6a6a6a" }, children: user ? "All AI tools unlocked." : "Sign in to unlock AI-powered matching." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `grid gap-4 ${visibleTools.length === 1 ? "grid-cols-1 max-w-xs" : "grid-cols-1 sm:grid-cols-2"}`, children: visibleTools.map((tool) => /* @__PURE__ */ jsxs(
        Link,
        {
          to: tool.to,
          onClick: tool.requiresAuth && !user ? (e) => {
            e.preventDefault();
            openAuthModal();
          } : void 0,
          className: "group rounded-2xl p-6 flex items-start gap-4 no-underline transition-all duration-200",
          style: {
            background: "#ffffff",
            border: "1px solid #ebebeb",
            boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px"
          },
          onMouseEnter: (e) => {
            const el = e.currentTarget;
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = "rgba(0,0,0,0.08) 0px 8px 24px";
          },
          onMouseLeave: (e) => {
            const el = e.currentTarget;
            el.style.transform = "";
            el.style.boxShadow = "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px";
          },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
                style: { background: "#f2f2f2", color: "#222222" },
                children: tool.icon
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pt-0.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", style: { color: "#222222", letterSpacing: "-0.01em" }, children: tool.label }),
                tool.requiresAuth && /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "rounded-full text-[10px] font-bold px-2 py-0.5",
                    style: { background: "linear-gradient(135deg, #ff385c, #e00b41)", color: "#ffffff", letterSpacing: "0.04em" },
                    children: "PRO"
                  }
                ),
                tool.badge && /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "rounded-full text-[10px] font-bold px-2 py-0.5",
                    style: { background: "rgba(255,56,92,0.1)", color: "#ff385c", border: "1px solid rgba(255,56,92,0.2)" },
                    children: tool.badge
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs leading-snug", style: { color: "#6a6a6a" }, children: tool.description })
            ] }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200",
                fill: "none",
                stroke: "#ff385c",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" })
              }
            )
          ]
        },
        tool.to
      )) })
    ] }),
    /* @__PURE__ */ jsx("section", { style: { borderTop: "1px solid #ebebeb", borderBottom: "1px solid #ebebeb", background: "#fafafa" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-6 py-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", style: { color: "#222222", letterSpacing: "-0.03em" }, children: "Browse by Horizon Europe Cluster" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", style: { color: "#6a6a6a" }, children: "Horizon Europe Pillar II organises research into six thematic clusters." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: Object.entries(HE_CLUSTERS).map(([num, cluster]) => /* @__PURE__ */ jsxs(
        Link,
        {
          to: `/search?cluster=${num}&prog=HE`,
          className: "group rounded-xl p-4 flex items-start gap-3 no-underline transition-all duration-150",
          style: {
            background: "#ffffff",
            border: `1.5px solid ${cluster.color}28`,
            boxShadow: `0 1px 4px ${cluster.color}0a`
          },
          onMouseEnter: (e) => {
            const el = e.currentTarget;
            el.style.borderColor = `${cluster.color}70`;
            el.style.boxShadow = `0 4px 16px ${cluster.color}18`;
            el.style.transform = "translateY(-1px)";
          },
          onMouseLeave: (e) => {
            const el = e.currentTarget;
            el.style.borderColor = `${cluster.color}28`;
            el.style.boxShadow = `0 1px 4px ${cluster.color}0a`;
            el.style.transform = "";
          },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "flex items-center justify-center rounded-full shrink-0 text-xs font-bold",
                style: {
                  width: 28,
                  height: 28,
                  background: `${cluster.color}15`,
                  color: cluster.color,
                  border: `1.5px solid ${cluster.color}35`
                },
                children: num
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-bold leading-tight mb-0.5", style: { color: cluster.color }, children: cluster.short }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] leading-snug", style: { color: "#6a6a6a" }, children: cluster.label })
            ] })
          ]
        },
        num
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(LatestAdditions, {}),
    !user && /* @__PURE__ */ jsx("section", { className: "dot-grid py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-6 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-bold mb-4", style: { fontSize: "clamp(32px, 4vw, 48px)", color: "#1a1a1a", letterSpacing: "-0.04em" }, children: "Ready to find your next EU grant?" }),
      /* @__PURE__ */ jsx("p", { className: "text-base mb-8", style: { color: "#6a6a6a" }, children: "Create a free account and run your first AI‑powered grant search in under a minute." }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn-brand btn-pill flex items-center gap-2 mx-auto",
          onClick: openAuthModal,
          style: { height: 52, fontSize: 16, paddingLeft: 32, paddingRight: 32 },
          children: [
            "Get started — it's free",
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M7 17L17 7M17 7H7M17 7v10" }) })
          ]
        }
      )
    ] }) })
  ] });
}
function useProjectSearch(filters) {
  return useQuery({
    queryKey: ["projectSearch", filters],
    queryFn: async () => {
      const query = buildProjectSearchQuery(filters);
      const data = await executeSparql(query);
      return parseProjectSummaries(data);
    },
    placeholderData: keepPreviousData
  });
}
async function postSearchEnhance(keyword, projects) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session == null ? void 0 : session.access_token;
  const response = await fetch("/api/search-enhance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...token ? { "Authorization": `Bearer ${token}` } : {}
    },
    body: JSON.stringify({ keyword, projects })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Search enhance failed: ${response.status}`);
  }
  return response.json();
}
function useSearchEnhance() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ keyword, projects }) => postSearchEnhance(keyword, projects),
    onError: (err) => {
      if (err.message === "limit_exceeded") navigate("/pricing");
    }
  });
}
async function apiFetch(path, init) {
  const resp = await fetch(path, init);
  if (!resp.ok) throw new Error(`History API ${resp.status}`);
  return resp.json();
}
function authHeaders$1(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
function useHistory(type) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["history", type ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      return apiFetch(`/api/history?${params}`, {
        headers: authHeaders$1(session.access_token)
      });
    },
    enabled: !!session,
    staleTime: 1e3 * 60 * 2
  });
}
function useSaveHistory() {
  const { session } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry) => {
      if (!session) return null;
      return apiFetch("/api/history", {
        method: "POST",
        headers: authHeaders$1(session.access_token),
        body: JSON.stringify(entry)
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] })
  });
}
function useDeleteHistory() {
  const { session } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!session) return;
      const url = id === "all" ? "/api/history" : `/api/history/${id}`;
      return apiFetch(url, {
        method: "DELETE",
        headers: authHeaders$1(session.access_token)
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] })
  });
}
function SearchBar({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef();
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  function handleChange(newValue) {
    setLocalValue(newValue);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      clearTimeout(timerRef.current);
      onChange(localValue);
    }
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative rounded-2xl overflow-hidden",
      style: {
        boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px"
      },
      children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            style: { color: "#6a6a6a" },
            children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: localValue,
            onChange: (e) => handleChange(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: "Search EU research projects…",
            className: "w-full pl-12 pr-5 py-4 text-base outline-none border-0",
            style: {
              background: "#ffffff",
              color: "#222222",
              fontFamily: "inherit",
              fontWeight: 500
            }
          }
        )
      ]
    }
  );
}
function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const query = buildCountriesQuery();
      const data = await executeSparql(query);
      return parseStringList(data, "countryName");
    },
    staleTime: Infinity
  });
}
function useEuroSciVoc() {
  return useQuery({
    queryKey: ["euroSciVoc"],
    queryFn: async () => {
      const query = buildEuroSciVocQuery();
      const data = await executeSparql(query);
      return parseStringList(data, "label");
    },
    staleTime: Infinity
  });
}
const JU_NAMES = Object.keys(JU_TOPIC_PATTERNS).sort();
function useManagingInstitutions() {
  return useQuery({
    queryKey: ["managingInstitutions"],
    queryFn: () => Promise.resolve(JU_NAMES),
    staleTime: Infinity
  });
}
function ClusterBubbles({ selected, onChange, label = "HE Cluster" }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    label && /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: "var(--color-text-muted)" }, children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: Object.entries(HE_CLUSTERS).map(([num, cluster]) => {
      const active = selected === num;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange(active ? null : num),
          title: `Cluster ${num}: ${cluster.label}`,
          className: "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1 transition-all duration-150 border cursor-pointer",
          style: {
            background: active ? cluster.color : `${cluster.color}14`,
            color: active ? "#fff" : cluster.color,
            borderColor: active ? cluster.color : `${cluster.color}40`,
            boxShadow: active ? `0 0 0 2px ${cluster.color}30` : "none"
          },
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "flex items-center justify-center rounded-full text-[9px] font-bold shrink-0",
                style: {
                  width: 14,
                  height: 14,
                  background: active ? "rgba(255,255,255,0.25)" : `${cluster.color}25`,
                  color: active ? "#fff" : cluster.color
                },
                children: num
              }
            ),
            cluster.short
          ]
        },
        num
      );
    }) })
  ] });
}
function FilterSelect({
  label,
  value,
  options,
  onChange,
  loading
}) {
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
    "select",
    {
      value: value || "",
      onChange: (e) => onChange(e.target.value || null),
      className: "w-full px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)] cursor-pointer appearance-none",
      style: { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "16px", paddingRight: "32px" },
      children: [
        /* @__PURE__ */ jsx("option", { value: "", children: loading ? "Loading..." : label }),
        options.map((opt) => /* @__PURE__ */ jsx("option", { value: opt, children: opt }, opt))
      ]
    }
  ) });
}
function FilterPanel({ filters, onFilterChange }) {
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: euroSciVoc = [], isLoading: esvLoading } = useEuroSciVoc();
  const { data: managingInstitutions = [], isLoading: institutionsLoading } = useManagingInstitutions();
  const [orgInput, setOrgInput] = useState(filters.organisation || "");
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      ClusterBubbles,
      {
        selected: filters.cluster,
        onChange: (v) => onFilterChange("cluster", v),
        label: "Horizon Europe Cluster"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Programme",
          value: filters.programme,
          options: ["FP7", "H2020", "HE"],
          onChange: (v) => onFilterChange("programme", v)
        }
      ),
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Country",
          value: filters.country,
          options: countries,
          onChange: (v) => onFilterChange("country", v),
          loading: countriesLoading
        }
      ),
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Field of Science",
          value: filters.euroSciVoc,
          options: euroSciVoc,
          onChange: (v) => onFilterChange("euroSciVoc", v),
          loading: esvLoading
        }
      ),
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Managing Institution",
          value: filters.managingInstitution,
          options: managingInstitutions,
          onChange: (v) => onFilterChange("managingInstitution", v),
          loading: institutionsLoading
        }
      ),
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Action Type",
          value: filters.actionType ?? null,
          options: ["RIA", "IA", "CSA", "ERC", "MSCA"],
          onChange: (v) => onFilterChange("actionType", v)
        }
      ),
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Min TRL",
          value: filters.trlMin != null ? String(filters.trlMin) : null,
          options: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
          onChange: (v) => onFilterChange("trlMin", v)
        }
      ),
      /* @__PURE__ */ jsx(
        FilterSelect,
        {
          label: "Max TRL",
          value: filters.trlMax != null ? String(filters.trlMax) : null,
          options: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
          onChange: (v) => onFilterChange("trlMax", v)
        }
      ),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: orgInput,
          onChange: (e) => setOrgInput(e.target.value),
          onBlur: () => onFilterChange("organisation", orgInput || null),
          onKeyDown: (e) => {
            if (e.key === "Enter") onFilterChange("organisation", orgInput || null);
          },
          placeholder: "Organisation",
          className: "w-40 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          value: filters.startDateFrom || "",
          onChange: (e) => onFilterChange("startDateFrom", e.target.value || null),
          className: "px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]",
          title: "Start date from"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          value: filters.startDateTo || "",
          onChange: (e) => onFilterChange("startDateTo", e.target.value || null),
          className: "px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]",
          title: "Start date to"
        }
      ) })
    ] }),
    " "
  ] });
}
function ActiveFilters({ filters, onRemove }) {
  const pills = [];
  if (filters.cluster && HE_CLUSTERS[filters.cluster]) {
    const c = HE_CLUSTERS[filters.cluster];
    pills.push({ key: "cluster", label: `Cluster ${filters.cluster}: ${c.short}`, color: c.color });
  }
  if (filters.programme) pills.push({ key: "programme", label: filters.programme });
  if (filters.country) pills.push({ key: "country", label: filters.country });
  if (filters.euroSciVoc) pills.push({ key: "euroSciVoc", label: filters.euroSciVoc });
  if (filters.organisation) pills.push({ key: "organisation", label: `Org: ${filters.organisation}` });
  if (filters.startDateFrom) pills.push({ key: "startDateFrom", label: `From: ${filters.startDateFrom}` });
  if (filters.startDateTo) pills.push({ key: "startDateTo", label: `To: ${filters.startDateTo}` });
  if (filters.status) pills.push({ key: "status", label: filters.status });
  if (filters.managingInstitution) pills.push({ key: "managingInstitution", label: `Inst: ${filters.managingInstitution}` });
  if (filters.actionType) pills.push({ key: "actionType", label: `Action: ${filters.actionType}` });
  if (filters.trlMin != null) pills.push({ key: "trlMin", label: `TRL ≥ ${filters.trlMin}` });
  if (filters.trlMax != null) pills.push({ key: "trlMax", label: `TRL ≤ ${filters.trlMax}` });
  if (pills.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm text-[var(--color-text-muted)] py-1", children: "Active:" }),
    pills.map(({ key, label, color }) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => onRemove(key),
        className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm transition-colors cursor-pointer border-0",
        style: color ? { background: `${color}18`, color, border: `1px solid ${color}35` } : { background: "color-mix(in srgb, var(--color-eu-blue) 20%, transparent)", color: "var(--color-eu-blue-lighter)" },
        children: [
          label,
          /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        ]
      },
      key
    ))
  ] });
}
const programmeConfig = {
  FP7: { label: "FP7", bg: "bg-[var(--color-badge-fp7)]" },
  H2020: { label: "H2020", bg: "bg-[var(--color-badge-h2020)]" },
  HE: { label: "Horizon Europe", bg: "bg-[var(--color-badge-he)]" }
};
function Badge({ programme }) {
  if (!programme) return null;
  const config = programmeConfig[programme];
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${config.bg}`, children: config.label });
}
function formatDate$2(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}
function getDateStatus(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (end < now) return "closed";
  if (end - now < 6 * 30 * 24 * 60 * 60 * 1e3) return "ending-soon";
  return "active";
}
const DATE_STATUS_CLASS = {
  closed: "text-red-400",
  "ending-soon": "text-[var(--color-amber)]",
  active: "text-emerald-400"
};
function ProjectCard({ project }) {
  const dateStatus = getDateStatus(project.endDate);
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: project.identifier ? `/project/${project.identifier}` : "#",
      className: "glass-card block rounded-xl p-5 no-underline",
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5 flex-wrap", children: [
            /* @__PURE__ */ jsx(Badge, { programme: project.programme }),
            project.managingInstitution && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)]", children: project.managingInstitution }),
            project.acronym && /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-semibold text-[var(--color-amber)]", children: project.acronym }),
            project.identifier && /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-[var(--color-text-muted)]", children: [
              "Grant #",
              project.identifier
            ] }),
            project.topicLabel && /* @__PURE__ */ jsx("span", { className: "font-mono text-xs px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--color-amber)_15%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)]", children: project.topicLabel })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "text-[var(--color-text-primary)] font-medium leading-snug line-clamp-2", children: project.title })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]", children: [
          (project.startDate || project.endDate) && /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1 ${dateStatus ? DATE_STATUS_CLASS[dateStatus] : ""}`, children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            formatDate$2(project.startDate),
            project.endDate && ` → ${formatDate$2(project.endDate)}`
          ] }),
          project.coordinator && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }),
            project.coordinator
          ] }),
          project.countries.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[var(--color-text-muted)]", children: [
            project.countries.slice(0, 5).join(", "),
            project.countries.length > 5 && ` +${project.countries.length - 5}`
          ] })
        ] })
      ]
    }
  );
}
function Spinner() {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" }) });
}
function EmptyState({ title, description }) {
  return /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
    /* @__PURE__ */ jsx("div", { className: "text-4xl mb-4 opacity-40", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto text-[var(--color-text-muted)]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-[var(--color-text-secondary)]", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-[var(--color-text-muted)]", children: description })
  ] });
}
function SearchResults({ projects, isLoading, isError, error, hasSearched }) {
  if (isLoading) return /* @__PURE__ */ jsx(Spinner, {});
  if (isError) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm", children: [
      /* @__PURE__ */ jsx("strong", { children: "Error:" }),
      " ",
      (error == null ? void 0 : error.message) || "Failed to search projects"
    ] });
  }
  if (!hasSearched) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "Search EU research projects",
        description: "Enter a keyword or apply filters to explore FP7, Horizon 2020, and Horizon Europe projects"
      }
    );
  }
  if (projects.length === 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "No projects found",
        description: "Try different keywords or adjust your filters"
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-3", children: projects.map((project) => /* @__PURE__ */ jsx(ProjectCard, { project }, project.uri)) });
}
function Pagination({ page, pageSize, resultCount, onPageChange }) {
  const hasMore = resultCount === pageSize;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-[var(--color-border)]", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-sm text-[var(--color-text-muted)]", children: [
      "Page ",
      page,
      resultCount > 0 && ` · Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + resultCount}`
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onPageChange(page - 1),
          disabled: page <= 1,
          className: "px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer",
          children: "Prev"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onPageChange(page + 1),
          disabled: !hasMore,
          className: "px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer",
          children: "Next"
        }
      )
    ] })
  ] });
}
const PAGE_SIZE$2 = 25;
function filtersFromParams(params) {
  return {
    keyword: params.get("q") || void 0,
    country: params.get("country") || void 0,
    organisation: params.get("org") || void 0,
    euroSciVoc: params.get("esv") || void 0,
    programme: params.get("prog") || null,
    cluster: params.get("cluster") || null,
    startDateFrom: params.get("from") || void 0,
    startDateTo: params.get("to") || void 0,
    status: params.get("status") || null,
    managingInstitution: params.get("inst") || void 0,
    actionType: params.get("actionType") ?? null,
    trlMin: params.get("trlMin") ? parseInt(params.get("trlMin"), 10) : null,
    trlMax: params.get("trlMax") ? parseInt(params.get("trlMax"), 10) : null,
    page: parseInt(params.get("page") || "1", 10),
    pageSize: PAGE_SIZE$2
  };
}
function filtersToParams(filters) {
  const params = {};
  if (filters.keyword) params.q = filters.keyword;
  if (filters.country) params.country = filters.country;
  if (filters.organisation) params.org = filters.organisation;
  if (filters.euroSciVoc) params.esv = filters.euroSciVoc;
  if (filters.programme) params.prog = filters.programme;
  if (filters.cluster) params.cluster = filters.cluster;
  if (filters.startDateFrom) params.from = filters.startDateFrom;
  if (filters.startDateTo) params.to = filters.startDateTo;
  if (filters.status) params.status = filters.status;
  if (filters.managingInstitution) params.inst = filters.managingInstitution;
  if (filters.actionType) params.actionType = filters.actionType;
  if (filters.trlMin != null) params.trlMin = String(filters.trlMin);
  if (filters.trlMax != null) params.trlMax = String(filters.trlMax);
  if (filters.page > 1) params.page = String(filters.page);
  return params;
}
function exportToCsv(projects) {
  const header = "Title,Acronym,Grant ID,Start Date,End Date,Countries";
  const rows = projects.map(
    (p) => [
      `"${(p.title || "").replace(/"/g, '""')}"`,
      p.acronym || "",
      p.identifier || "",
      p.startDate || "",
      p.endDate || "",
      `"${p.countries.join("; ")}"`
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cordis-results-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function SearchPage() {
  var _a;
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);
  useEffect(() => {
    const kw = filters.keyword;
    document.title = kw ? `"${kw}" — CORDIS Project Search` : "Search EU Research Projects — CORDIS Explorer";
  }, [filters.keyword]);
  const { data: projects = [], isLoading, isError, error } = useProjectSearch(filters);
  const saveHistory = useSaveHistory();
  const savedKeyRef = useRef("");
  useEffect(() => {
    if (!filters.keyword || projects.length === 0) return;
    const key = JSON.stringify({ keyword: filters.keyword, page: filters.page });
    if (savedKeyRef.current === key) return;
    savedKeyRef.current = key;
    saveHistory.mutate({
      query_type: "project_search",
      query_params: { keyword: filters.keyword, cluster: filters.cluster, actionType: filters.actionType, country: filters.country },
      result_count: projects.length,
      results_snapshot: projects.slice(0, 8).map((p) => ({ title: p.title, acronym: p.acronym, identifier: p.identifier }))
    });
  }, [projects, filters.keyword, filters.page]);
  const enhanceMutation = useSearchEnhance();
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const enhancedProjects = ((_a = enhanceMutation.data) == null ? void 0 : _a.results) ?? null;
  const displayProjects = aiEnhanced && enhancedProjects ? enhancedProjects.map((ep) => (projects == null ? void 0 : projects.find((p) => p.uri === ep.uri)) ?? ep) : projects;
  useEffect(() => {
    setAiEnhanced(false);
    enhanceMutation.reset();
  }, [filters.keyword]);
  const updateFilters = useCallback(
    (updates) => {
      const newFilters = { ...filters, ...updates, page: updates.page ?? 1 };
      setSearchParams(filtersToParams(newFilters));
    },
    [filters, setSearchParams]
  );
  function handleKeywordChange(keyword) {
    updateFilters({ keyword: keyword || void 0 });
  }
  function handleFilterChange(key, value) {
    const numericFields = ["trlMin", "trlMax"];
    const parsedValue = numericFields.includes(key) && value !== null ? parseInt(value, 10) : value;
    updateFilters({ [key]: parsedValue ?? void 0 });
  }
  function handleRemoveFilter(key) {
    updateFilters({ [key]: void 0 });
  }
  function handlePageChange(page) {
    updateFilters({ ...filters, page });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(SearchBar, { value: filters.keyword || "", onChange: handleKeywordChange }),
      /* @__PURE__ */ jsx(FilterPanel, { filters, onFilterChange: handleFilterChange }),
      /* @__PURE__ */ jsx(ActiveFilters, { filters, onRemove: handleRemoveFilter })
    ] }),
    projects.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-[var(--color-text-muted)]", children: [
        projects.length,
        " result",
        projects.length !== 1 ? "s" : "",
        " on this page"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => exportToCsv(projects),
          className: "text-sm text-[var(--color-eu-blue-lighter)] hover:underline cursor-pointer bg-transparent border-0",
          children: "Export CSV"
        }
      )
    ] }),
    projects && projects.length > 0 && filters.keyword && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            if (!aiEnhanced) {
              enhanceMutation.mutate(
                { keyword: filters.keyword, projects: projects.slice(0, 30) },
                { onSuccess: () => setAiEnhanced(true) }
              );
            } else {
              setAiEnhanced(false);
            }
          },
          disabled: enhanceMutation.isPending,
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
          style: aiEnhanced ? { background: "var(--color-eu-blue)", color: "#fff", borderColor: "var(--color-eu-blue)" } : { background: "transparent", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" },
          children: [
            enhanceMutation.isPending ? /* @__PURE__ */ jsx("span", { className: "animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" }) : /* @__PURE__ */ jsx("span", { children: "✦" }),
            aiEnhanced ? "AI ranked" : "AI re-rank"
          ]
        }
      ),
      aiEnhanced && /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--color-text-secondary)]", children: "Results re-ordered by semantic relevance" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
      SearchResults,
      {
        projects: displayProjects ?? [],
        isLoading,
        isError,
        error,
        hasSearched: true
      }
    ) }),
    projects.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Pagination,
      {
        page: filters.page,
        pageSize: filters.pageSize,
        resultCount: projects.length,
        onPageChange: handlePageChange
      }
    ) })
  ] });
}
function useProjectDetail(projectId) {
  const detailQuery = useQuery({
    queryKey: ["projectDetail", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const query = buildProjectDetailQuery(projectId);
      const data = await executeSparql(query);
      return parseProjectDetail(data);
    },
    enabled: !!projectId
  });
  const publicationsQuery = useQuery({
    queryKey: ["projectPublications", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const query = buildPublicationsQuery(projectId);
      const data = await executeSparql(query);
      return parsePublications(data);
    },
    enabled: !!projectId
  });
  return { detail: detailQuery, publications: publicationsQuery };
}
function ParticipantList({ participants }) {
  if (participants.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-3", children: [
      "Participants (",
      participants.length,
      ")"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-[var(--color-border)]", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left py-2 pr-4 text-[var(--color-text-muted)] font-medium", children: "Organisation" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-2 pr-4 text-[var(--color-text-muted)] font-medium", children: "Role" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-[var(--color-text-muted)] font-medium", children: "Country" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: participants.map((p, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-[var(--color-border)] border-opacity-50", children: [
        /* @__PURE__ */ jsx("td", { className: "py-2 pr-4 text-[var(--color-text-primary)]", children: /* @__PURE__ */ jsx(
          Link,
          {
            to: `/org/${encodeURIComponent(p.orgName)}`,
            className: "text-[var(--color-eu-blue-lighter)] hover:underline",
            children: p.orgName
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "py-2 pr-4", children: /* @__PURE__ */ jsx(
          "span",
          {
            className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.role.toLowerCase().includes("coordinator") ? "bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)]" : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]"}`,
            children: p.role
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "py-2 text-[var(--color-text-secondary)]", children: p.country })
      ] }, i)) })
    ] }) })
  ] });
}
function PublicationList({ publications }) {
  if (publications.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-3", children: [
      "Publications (",
      publications.length,
      ")"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: publications.map((pub, i) => /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-lg p-4", children: [
      pub.title && /* @__PURE__ */ jsx("h4", { className: "text-[var(--color-text-primary)] font-medium leading-snug", children: pub.title }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]", children: [
        pub.authors && /* @__PURE__ */ jsx("span", { children: pub.authors }),
        pub.publisher && /* @__PURE__ */ jsx("span", { children: pub.publisher }),
        pub.doi && /* @__PURE__ */ jsx(
          "a",
          {
            href: pub.doi.startsWith("http") ? pub.doi : `https://doi.org/${pub.doi}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-[var(--color-eu-blue-lighter)] hover:underline font-mono text-xs",
            children: pub.doi
          }
        )
      ] })
    ] }, i)) })
  ] });
}
function formatDate$1(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}
function ProjectDetailView({ project, publications }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsx(Badge, { programme: project.programme }),
        project.acronym && /* @__PURE__ */ jsx("span", { className: "font-mono text-lg font-bold text-[var(--color-amber)]", children: project.acronym })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)] leading-tight", children: project.title }),
      project.identifier && /* @__PURE__ */ jsxs("p", { className: "mt-1 font-mono text-sm text-[var(--color-text-muted)]", children: [
        "Grant Agreement #",
        project.identifier
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--color-text-muted)] mb-1", children: "Start Date" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[var(--color-text-primary)]", children: formatDate$1(project.startDate) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--color-text-muted)] mb-1", children: "End Date" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[var(--color-text-primary)]", children: formatDate$1(project.endDate) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--color-text-muted)] mb-1", children: "Coordinator" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[var(--color-text-primary)]", children: project.coordinator || "N/A" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--color-text-muted)] mb-1", children: "Countries" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[var(--color-text-primary)]", children: project.countries.join(", ") || "N/A" })
      ] })
    ] }),
    project.abstract && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-2", children: "Description" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line", children: project.abstract })
    ] }),
    project.keywords && project.keywords.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-2", children: "Keywords" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: project.keywords.map((kw) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[color-mix(in_srgb,var(--color-eu-blue-lighter)_15%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)]",
          children: kw
        },
        kw
      )) })
    ] }),
    /* @__PURE__ */ jsx(ParticipantList, { participants: project.participants }),
    /* @__PURE__ */ jsx(PublicationList, { publications }),
    project.identifier && /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-[var(--color-border)]", children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: `https://cordis.europa.eu/project/id/${project.identifier}`,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "inline-flex items-center gap-2 text-sm text-[var(--color-eu-blue-lighter)] hover:underline",
        children: [
          "View on CORDIS",
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) })
        ]
      }
    ) })
  ] });
}
function ProjectPage() {
  var _a;
  const { id } = useParams();
  const { detail, publications } = useProjectDetail(id);
  useEffect(() => {
    var _a2;
    if ((_a2 = detail.data) == null ? void 0 : _a2.title) {
      const acronym = detail.data.acronym ? ` (${detail.data.acronym})` : "";
      document.title = `${detail.data.title}${acronym} — CORDIS Explorer`;
    } else {
      document.title = "Project Details — CORDIS Explorer";
    }
  }, [detail.data]);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/",
        className: "inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 no-underline transition-colors",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }),
          "Back to search"
        ]
      }
    ),
    detail.isLoading && /* @__PURE__ */ jsx(Spinner, {}),
    detail.isError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm", children: [
      /* @__PURE__ */ jsx("strong", { children: "Error:" }),
      " ",
      ((_a = detail.error) == null ? void 0 : _a.message) || "Failed to load project"
    ] }),
    detail.data === null && !detail.isLoading && /* @__PURE__ */ jsx(EmptyState, { title: "Project not found", description: "The requested project could not be found" }),
    detail.data && /* @__PURE__ */ jsx(
      ProjectDetailView,
      {
        project: detail.data,
        publications: publications.data || []
      }
    )
  ] });
}
function Step1Contact({ data, onChange, onNext }) {
  const valid = !!(data.email && data.firstName && data.lastName && data.organisationName);
  function handleSubmit(e) {
    e.preventDefault();
    if (valid) onNext();
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "step-title-row", children: [
      /* @__PURE__ */ jsx("span", { className: "step-num", children: "1" }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[var(--color-text-primary)]", children: "About You" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Email ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          required: true,
          value: data.email ?? "",
          onChange: (e) => onChange({ email: e.target.value }),
          className: "gm-input",
          placeholder: "you@company.io"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "First Name ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            required: true,
            value: data.firstName ?? "",
            onChange: (e) => onChange({ firstName: e.target.value }),
            className: "gm-input",
            placeholder: "Jane"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Last Name ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            required: true,
            value: data.lastName ?? "",
            onChange: (e) => onChange({ lastName: e.target.value }),
            className: "gm-input",
            placeholder: "Smith"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Organisation Name ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          required: true,
          value: data.organisationName ?? "",
          onChange: (e) => onChange({ organisationName: e.target.value }),
          className: "gm-input",
          placeholder: "Company or project name (working name OK if pre-incorporation)"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: !valid, className: "gm-btn-primary", children: "Next →" }) })
  ] });
}
const ORGANISATION_TYPES = ["Startup", "SME", "Non-profit / NGO", "Research Organisation", "Pre-incorporation / Solo Founder", "Other"];
const SECTORS = ["AI / Machine Learning", "Fintech / Finance", "Cleantech / Energy", "Health / Biotech", "Logistics / Supply Chain", "AgriTech / Food", "Cybersecurity", "Space / Aerospace", "Creative / Cultural", "Tourism / Hospitality", "Education / EdTech", "Construction / Built Environment", "Manufacturing / Industry 4.0", "Social Impact / Inclusion", "Other"];
const STAGES$1 = ["Idea / Pre-product", "MVP / Prototype", "Early Revenue", "Growth / Scaling", "Established"];
function Step2Startup({ data, onChange, onNext, onBack }) {
  const { data: countries = [] } = useCountries();
  const valid = !!(data.organisationType && data.countryOfTaxResidence && data.sector && data.productDescription && data.stage);
  function handleSubmit(e) {
    e.preventDefault();
    if (valid) onNext();
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "step-title-row", children: [
      /* @__PURE__ */ jsx("span", { className: "step-num", children: "2" }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[var(--color-text-primary)]", children: "Your Startup" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Organisation Type ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.organisationType ?? "", onChange: (e) => onChange({ organisationType: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          ORGANISATION_TYPES.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Sector ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.sector ?? "", onChange: (e) => onChange({ sector: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          SECTORS.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Country of Tax Residence ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.countryOfTaxResidence ?? "", onChange: (e) => onChange({ countryOfTaxResidence: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Country of Incorporation" }),
        /* @__PURE__ */ jsxs("select", { value: data.countryOfIncorporation ?? "", onChange: (e) => onChange({ countryOfIncorporation: e.target.value || void 0 }), className: "gm-select", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— optional —" }),
          countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Product / Service Description ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          required: true,
          value: data.productDescription ?? "",
          onChange: (e) => onChange({ productDescription: e.target.value }),
          className: "gm-textarea",
          placeholder: "Describe your product or service in 2-3 sentences. Be specific. This helps us match you accurately.",
          rows: 4
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Stage ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsxs("select", { value: data.stage ?? "", onChange: (e) => onChange({ stage: e.target.value }), className: "gm-select", required: true, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
        STAGES$1.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onBack, className: "gm-btn-secondary", children: "← Back" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: !valid, className: "gm-btn-primary", children: "Next →" })
    ] })
  ] });
}
const TEAM_SIZES$1 = ["Solo founder", "2-5", "6-15", "16-50", "51+"];
const REVENUES$1 = ["Pre-revenue", "Under €100K", "€100K–€500K", "€500K–€2M", "€2M–€10M", "Over €10M"];
const RD_OPTIONS$1 = ["Yes — active R&D", "Planned — within 12 months"];
const COFUNDING$1 = ["Up to 25%", "25–50%", "Over 50%", "Not sure"];
const MATCH_COUNTS$2 = [5, 10, 15];
function Step3Funding({ data, onChange, onBack, onSubmit, isLoading }) {
  const [gdpr, setGdpr] = useState(false);
  const [terms, setTerms] = useState(false);
  const valid = !!(data.teamSize && data.rdActivity && gdpr && terms);
  function handleSubmit(e) {
    e.preventDefault();
    if (valid) onSubmit();
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "step-title-row", children: [
      /* @__PURE__ */ jsx("span", { className: "step-num", children: "3" }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[var(--color-text-primary)]", children: "Funding Readiness" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Team Size ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.teamSize ?? "", onChange: (e) => onChange({ teamSize: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          TEAM_SIZES$1.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Annual Revenue" }),
        /* @__PURE__ */ jsxs("select", { value: data.annualRevenue ?? "", onChange: (e) => onChange({ annualRevenue: e.target.value || void 0 }), className: "gm-select", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          REVENUES$1.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "R&D Activity ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.rdActivity ?? "", onChange: (e) => onChange({ rdActivity: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          RD_OPTIONS$1.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Co-funding Capacity" }),
        /* @__PURE__ */ jsxs("select", { value: data.coFundingCapacity ?? "", onChange: (e) => onChange({ coFundingCapacity: e.target.value || void 0 }), className: "gm-select", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          COFUNDING$1.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Top Matches to Return ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx("select", { value: data.matchCount ?? 5, onChange: (e) => onChange({ matchCount: Number(e.target.value) }), className: "gm-select", children: MATCH_COUNTS$2.map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
        "Top ",
        n,
        " matches"
      ] }, n)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2 border-t border-[var(--color-border)]", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: gdpr, onChange: (e) => setGdpr(e.target.checked), className: "mt-1 accent-[var(--color-eu-blue-lighter)]", required: true }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--color-text-secondary)]", children: [
          "I consent to processing of my data to scan EU funding opportunities and send me matching alerts. I can unsubscribe at any time. ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: terms, onChange: (e) => setTerms(e.target.checked), className: "mt-1 accent-[var(--color-eu-blue-lighter)]", required: true }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--color-text-secondary)]", children: [
          "I have read and agree to the Terms and Conditions. ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onBack, disabled: isLoading, className: "gm-btn-secondary", children: "← Back" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: !valid || isLoading, className: "gm-btn-scan", children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-4 h-4", fill: "none", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })
        ] }),
        "Scanning…"
      ] }) : "🔍 Scan My Profile" })
    ] })
  ] });
}
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return (session == null ? void 0 : session.access_token) ? { "Authorization": `Bearer ${session.access_token}` } : {};
}
function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const headers = await authHeaders();
      if (!headers["Authorization"]) return [];
      const resp = await fetch("/api/watchlist", { headers });
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.items ?? [];
    },
    staleTime: 1e3 * 60 * 5
  });
}
function useToggleWatchlist() {
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: async (item) => {
      const headers = { ...await authHeaders(), "Content-Type": "application/json" };
      const resp = await fetch("/api/watchlist", {
        method: "POST",
        headers,
        body: JSON.stringify(item)
      });
      if (!resp.ok) throw new Error("Failed to save to watchlist");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] })
  });
  const remove = useMutation({
    mutationFn: async (callId) => {
      const headers = await authHeaders();
      const resp = await fetch(`/api/watchlist/${encodeURIComponent(callId)}`, {
        method: "DELETE",
        headers
      });
      if (!resp.ok) throw new Error("Failed to remove from watchlist");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] })
  });
  return { add, remove };
}
const VERDICT_STYLES = {
  GO: {
    card: "border-emerald-500/20 bg-emerald-500/[0.04]",
    badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
  },
  MAYBE: {
    card: "border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-amber)_4%,transparent)]",
    badge: "bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_35%,transparent)]"
  },
  "NO-GO": {
    card: "border-red-500/15 bg-red-500/[0.04]",
    badge: "bg-red-500/15 text-red-400 border border-red-500/30"
  }
};
function MatchCard({ result }) {
  const [expanded, setExpanded] = useState(false);
  const styles = VERDICT_STYLES[result.verdict] ?? VERDICT_STYLES["MAYBE"];
  const { data: watchlist = [] } = useWatchlist();
  const { add, remove } = useToggleWatchlist();
  const isSaved = watchlist.some((w) => w.call_id === result.callId);
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border ${styles.card}`, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setExpanded((e) => !e),
        className: "w-full text-left p-4 flex items-start justify-between gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-semibold text-[var(--color-text-primary)] text-sm leading-snug", children: result.callTitle }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-muted)] mt-0.5 font-mono", children: result.callId }),
            result.callId && /* @__PURE__ */ jsx(
              "a",
              {
                href: `/partner-search?callId=${encodeURIComponent(result.callId)}`,
                className: "inline-flex items-center gap-1 text-xs text-[var(--color-eu-blue-lighter)] hover:underline mt-1",
                children: "🤝 Find partners →"
              }
            ),
            (result.deadline || result.budget) && /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--color-text-muted)] mt-1", children: [
              result.budget && /* @__PURE__ */ jsx("span", { children: result.budget }),
              result.deadline && result.budget && /* @__PURE__ */ jsx("span", { className: "mx-1", children: "·" }),
              result.deadline && /* @__PURE__ */ jsxs("span", { children: [
                "Deadline: ",
                result.deadline
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 flex-wrap", children: [
              result.consortiumRequired ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" }) }),
                "Consortium · ",
                result.minPartners,
                "+ partners · ",
                result.minCountries,
                "+ countries"
              ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }),
                "Solo application"
              ] }),
              result.fundingType === "grant" && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/8 text-emerald-400 border border-emerald-500/20", children: "Grant" }),
              result.fundingType === "blended" && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20", children: "Grant + Equity" }),
              result.fundingType === "guarantee" && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20", children: "Loan / Guarantee" }),
              result.fundingType === "fellowship" && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20", children: "Fellowship" }),
              result.minTrl !== void 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20", children: [
                "TRL ",
                result.minTrl,
                result.maxTrl ? `–${result.maxTrl}` : "+"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  if (isSaved) {
                    remove.mutate(result.callId);
                  } else {
                    add.mutate({
                      call_id: result.callId,
                      call_title: result.callTitle,
                      deadline: result.deadline
                    });
                  }
                },
                title: isSaved ? "Remove from watchlist" : "Save to watchlist",
                className: "text-lg leading-none transition-transform hover:scale-110 ml-2 shrink-0",
                "aria-label": isSaved ? "Remove from watchlist" : "Add to watchlist",
                children: isSaved ? "⭐" : "☆"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: `px-2.5 py-1 rounded-full text-xs font-bold ${styles.badge}`, children: [
              result.matchScore,
              " · ",
              result.verdict
            ] }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-4 h-4 text-[var(--color-text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ] })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxs("div", { className: "px-4 pb-4 border-t border-[var(--color-border)] pt-3 space-y-3", children: [
      (result.typicalSuccessRate || result.applicationEffortHours || result.timeToMoneyMonths) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--color-text-muted)] pb-2 border-b border-[var(--color-border)]", children: [
        result.typicalSuccessRate && /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--color-text-secondary)]", children: "Success rate:" }),
          " ",
          result.typicalSuccessRate
        ] }),
        result.applicationEffortHours && /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--color-text-secondary)]", children: "Application effort:" }),
          " ~",
          result.applicationEffortHours,
          "h"
        ] }),
        result.timeToMoneyMonths && /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--color-text-secondary)]", children: "Time to funding:" }),
          " ~",
          result.timeToMoneyMonths,
          " months"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-3 gap-y-1 text-xs", children: [
        result.reasoning.strengths.map((s) => /* @__PURE__ */ jsxs("span", { className: "text-emerald-400", children: [
          "✓ ",
          s
        ] }, s)),
        result.reasoning.weaknesses.map((w) => /* @__PURE__ */ jsxs("span", { className: "text-[var(--color-amber)]", children: [
          "⚠ ",
          w
        ] }, w)),
        result.reasoning.redFlags.map((f) => /* @__PURE__ */ jsxs("span", { className: "text-red-400", children: [
          "✗ ",
          f
        ] }, f))
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-muted)] leading-relaxed", children: result.strategicFitAnalysis }),
      result.recommendedPivot && /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--color-text-secondary)] italic", children: [
        "Pivot suggestion: ",
        result.recommendedPivot
      ] })
    ] })
  ] });
}
function generateMarkdown(profile, results) {
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return `# Startup Profile: ${profile.organisationName}
Generated: ${date}

## Contact
- **Name:** ${profile.firstName} ${profile.lastName}
- **Email:** ${profile.email}

## Organisation
- **Type:** ${profile.organisationType}
- **Country (Tax):** ${profile.countryOfTaxResidence}
- **Sector:** ${profile.sector}

## Mission Statement
${profile.productDescription}

## Development Stage
- **Stage:** ${profile.stage}
- **Team Size:** ${profile.teamSize}
- **Annual Revenue:** ${profile.annualRevenue ?? "Not provided"}
- **R&D Activity:** ${profile.rdActivity}
- **Co-funding Capacity:** ${profile.coFundingCapacity ?? "Not provided"}

## SME Eligibility
- Headcount: ${profile.teamSize} (< 250 ✓)
- **SME Status: Eligible ✓**

## Top Matching EU Grants
${results.map((r, i) => `
### ${i + 1}. ${r.callTitle} — Score: ${r.matchScore}/100 (${r.verdict})
- **Call ID:** ${r.callId}
- **Deadline:** ${r.deadline ?? "TBC"}
- **Budget:** ${r.budget ?? "TBC"}
- **Strengths:** ${r.reasoning.strengths.join(", ")}
- **Weaknesses:** ${r.reasoning.weaknesses.join(", ")}
- ${r.strategicFitAnalysis}
`).join("")}`;
}
function downloadMarkdown(profile, results) {
  const md = generateMarkdown(profile, results);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.organisationName.toLowerCase().replace(/\s+/g, "-")}-grant-profile.md`;
  a.click();
  URL.revokeObjectURL(url);
}
function MatchResults({ profile, results, filteredCalls }) {
  const [showFiltered, setShowFiltered] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "mt-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-[var(--color-text-primary)]", children: "Your Top Matches" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-[var(--color-text-muted)] mt-1", children: [
          results.length,
          " match",
          results.length !== 1 ? "es" : "",
          " found for",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-text-secondary)]", children: profile.organisationName }),
          " · ",
          profile.sector,
          " · ",
          profile.countryOfTaxResidence
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => downloadMarkdown(profile, results),
          className: "flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-lg px-3 py-2 hover:border-[var(--color-eu-blue-lighter)] hover:text-[var(--color-eu-blue-lighter)] transition-colors",
          children: "⬇ Download Profile (.md)"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-xl border border-[var(--color-border)] bg-white/[0.03] px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-text-muted)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold text-[var(--color-text-secondary)]", children: "Score 0–100" }),
        "— how well your profile fits the call"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]", children: "GO" }),
        /* @__PURE__ */ jsx("span", { children: "Strong match — worth applying" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_35%,transparent)] font-bold text-[11px]", children: "MAYBE" }),
        /* @__PURE__ */ jsx("span", { children: "Partial fit — possible with pivots" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-[11px]", children: "NO-GO" }),
        /* @__PURE__ */ jsx("span", { children: "Poor fit — significant gaps" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "w-full text-[var(--color-text-muted)] opacity-70", children: "Click any card to see Claude's reasoning, strengths, and weaknesses." })
    ] }),
    results.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-muted)] text-center py-8", children: "No matches found for your current profile. Try adjusting your sector or stage." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: results.map((r) => /* @__PURE__ */ jsx(MatchCard, { result: r }, r.callId)) }),
    filteredCalls.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowFiltered((f) => !f),
          className: "flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors",
          children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-3.5 h-3.5 transition-transform ${showFiltered ? "rotate-90" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" })
              }
            ),
            filteredCalls.length,
            " call",
            filteredCalls.length !== 1 ? "s" : "",
            " not shown — ineligible based on your profile"
          ]
        }
      ),
      showFiltered && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: filteredCalls.map((fc) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-4 py-3 flex items-start gap-3",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-[var(--color-text-muted)] shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-[var(--color-text-secondary)]", children: fc.callTitle }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-muted)] mt-0.5", children: fc.reason })
            ] })
          ]
        },
        fc.callId
      )) })
    ] })
  ] });
}
async function postGrantMatch(profile, tool) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session == null ? void 0 : session.access_token;
  const response = await fetch("/api/grant-match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...token ? { "Authorization": `Bearer ${token}` } : {}
    },
    body: JSON.stringify({ ...profile, _tool: tool })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Grant match failed: ${response.status}`);
  }
  return response.json();
}
function useGrantMatch(tool = "grant_match") {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (profile) => postGrantMatch(profile, tool),
    onError: (err) => {
      if (err.message === "limit_exceeded") navigate("/pricing");
    }
  });
}
const STEP_LABELS$1 = ["About You", "Your Startup", "Funding Readiness"];
function ProfileWizard({ preferredCluster }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const { mutate, isPending, isError, error, data: matchData } = useGrantMatch("grant_match");
  function update(updates) {
    setData((prev) => ({ ...prev, ...updates }));
  }
  function handleSubmit() {
    mutate({
      ...data,
      ...preferredCluster ? { preferredCluster } : {}
    });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mb-2", children: STEP_LABELS$1.map((_, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `flex-1 h-[3px] rounded-full transition-colors ${i < step ? "bg-[var(--color-eu-blue-lighter)]" : i === step ? "bg-[var(--color-eu-blue-lighter)] opacity-80" : "bg-white/10"}`
      },
      i
    )) }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-muted)] mb-5", children: STEP_LABELS$1.map((label, i) => /* @__PURE__ */ jsxs("span", { children: [
      i > 0 && /* @__PURE__ */ jsx("span", { className: "mx-1.5", children: "→" }),
      /* @__PURE__ */ jsxs("span", { className: i === step ? "text-[var(--color-text-secondary)]" : i < step ? "line-through opacity-50" : "", children: [
        label,
        i < step ? " ✓" : ""
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-xl p-6", children: [
      step === 0 && /* @__PURE__ */ jsx(Step1Contact, { data, onChange: update, onNext: () => setStep(1) }),
      step === 1 && /* @__PURE__ */ jsx(Step2Startup, { data, onChange: update, onNext: () => setStep(2), onBack: () => setStep(0) }),
      step === 2 && /* @__PURE__ */ jsx(Step3Funding, { data, onChange: update, onBack: () => setStep(1), onSubmit: handleSubmit, isLoading: isPending })
    ] }),
    isError && /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400", children: (error == null ? void 0 : error.message) ?? "Matching failed. Please try again." }),
    matchData && /* @__PURE__ */ jsx(MatchResults, { profile: data, results: matchData.results, filteredCalls: matchData.filteredCalls })
  ] });
}
function AuthGate({ children, title, description }) {
  const { user, loading, openAuthModal } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 px-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-[var(--color-eu-blue)]/10 border border-[var(--color-eu-blue)]/20 flex items-center justify-center mb-5", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-[var(--color-eu-blue-lighter)]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-[var(--color-text-primary)] mb-2", children: title ?? "Sign in to access this tool" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-muted)] max-w-xs mb-6", children: description ?? "Create a free account to use AI-powered grant matching." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: openAuthModal,
          className: "px-6 py-2.5 rounded-lg bg-[var(--color-eu-blue)] hover:bg-[var(--color-eu-blue-lighter)] text-white text-sm font-semibold transition-colors",
          children: "Sign in / Create account"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function GrantMatchPage() {
  useEffect(() => {
    document.title = "AI Grant Matching — Find EU Grants for Your Startup | CORDIS Explorer";
    return () => {
      document.title = "CORDIS Explorer — Search EU-Funded Research Projects";
    };
  }, []);
  const [cluster, setCluster] = useState(null);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block bg-[color-mix(in_srgb,var(--color-amber)_12%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4", children: "100% Free · AI-Powered" }),
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3", children: [
        "Find EU Grants That",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-eu-blue-lighter)]", children: "Match Your Startup" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[var(--color-text-secondary)] text-sm leading-relaxed", children: "Answer a few questions and we'll scan 900+ open EU funding calls — ranked by how well they fit your profile using Claude AI." })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-2xl p-5 mb-6",
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)"
        },
        children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold mb-1", style: { color: "var(--color-text-primary)" }, children: [
            "Which Horizon Europe cluster fits your work? ",
            /* @__PURE__ */ jsx("span", { style: { color: "var(--color-text-muted)", fontWeight: 400 }, children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs mb-3", style: { color: "var(--color-text-muted)" }, children: "Selecting a cluster helps Claude focus the search on the most relevant funding calls." }),
          /* @__PURE__ */ jsx(ClusterBubbles, { selected: cluster, onChange: setCluster, label: "" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      AuthGate,
      {
        title: "Sign in to run your grant match",
        description: "Create a free account to use AI-powered grant matching. It takes less than a minute.",
        children: /* @__PURE__ */ jsx(ProfileWizard, { preferredCluster: cluster })
      }
    )
  ] });
}
function PMStep1({ data, onChange, onNext }) {
  const valid = !!(data.email && data.firstName && data.lastName && data.organisationName);
  function handleSubmit(e) {
    e.preventDefault();
    if (valid) onNext();
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "step-title-row", children: [
      /* @__PURE__ */ jsx("span", { className: "step-num", children: "1" }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[var(--color-text-primary)]", children: "About You" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Email ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          required: true,
          value: data.email ?? "",
          onChange: (e) => onChange({ email: e.target.value }),
          className: "gm-input",
          placeholder: "you@company.io"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "First Name ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            required: true,
            value: data.firstName ?? "",
            onChange: (e) => onChange({ firstName: e.target.value }),
            className: "gm-input",
            placeholder: "Jane"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Last Name ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            required: true,
            value: data.lastName ?? "",
            onChange: (e) => onChange({ lastName: e.target.value }),
            className: "gm-input",
            placeholder: "Smith"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Organisation / Institution ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          required: true,
          value: data.organisationName ?? "",
          onChange: (e) => onChange({ organisationName: e.target.value }),
          className: "gm-input",
          placeholder: "Company, university, research institute, or working name"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: !valid, className: "gm-btn-primary", children: "Next →" }) })
  ] });
}
const ORG_TYPES$1 = ["Startup", "SME", "Non-profit / NGO", "Research Organisation", "Pre-incorporation / Solo Founder", "Other"];
const STAGES = ["Idea / Pre-product", "MVP / Prototype", "Early Revenue", "Growth / Scaling", "Established"];
const TEAM_SIZES = ["Solo founder", "2-5", "6-15", "16-50", "51+"];
const REVENUES = ["Pre-revenue", "Under €100K", "€100K–€500K", "€500K–€2M", "€2M–€10M", "Over €10M"];
const RD_OPTIONS = ["Yes — active R&D", "Planned — within 12 months"];
const COFUNDING = ["Up to 25%", "25–50%", "Over 50%", "Not sure"];
const MATCH_COUNTS$1 = [5, 10, 15];
function PMStep2({ data, onChange, onBack, onSubmit, isLoading }) {
  const { data: countries = [] } = useCountries();
  const [gdpr, setGdpr] = useState(false);
  const [terms, setTerms] = useState(false);
  const valid = !!(data.organisationType && data.countryOfTaxResidence && data.productDescription && data.stage && data.teamSize && data.rdActivity && gdpr && terms);
  function handleSubmit(e) {
    e.preventDefault();
    if (valid) onSubmit();
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "step-title-row", children: [
      /* @__PURE__ */ jsx("span", { className: "step-num", children: "2" }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[var(--color-text-primary)]", children: "Your Profile" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Organisation Type ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.organisationType ?? "", onChange: (e) => onChange({ organisationType: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          ORG_TYPES$1.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Country of Tax Residence ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.countryOfTaxResidence ?? "", onChange: (e) => onChange({ countryOfTaxResidence: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
        "Tell us about your work ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          required: true,
          value: data.productDescription ?? "",
          onChange: (e) => onChange({ productDescription: e.target.value }),
          className: "gm-textarea",
          placeholder: "Describe what you do, what problem you solve, and what makes your work innovative. The more detail, the better the match.",
          rows: 5
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Stage ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.stage ?? "", onChange: (e) => onChange({ stage: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          STAGES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Team Size ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.teamSize ?? "", onChange: (e) => onChange({ teamSize: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          TEAM_SIZES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "R&D Activity ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: data.rdActivity ?? "", onChange: (e) => onChange({ rdActivity: e.target.value }), className: "gm-select", required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          RD_OPTIONS.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Annual Revenue" }),
        /* @__PURE__ */ jsxs("select", { value: data.annualRevenue ?? "", onChange: (e) => onChange({ annualRevenue: e.target.value || void 0 }), className: "gm-select", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          REVENUES.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Co-funding Capacity" }),
        /* @__PURE__ */ jsxs("select", { value: data.coFundingCapacity ?? "", onChange: (e) => onChange({ coFundingCapacity: e.target.value || void 0 }), className: "gm-select", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
          COFUNDING.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Top Matches to Return" }),
        /* @__PURE__ */ jsx("select", { value: data.matchCount ?? 5, onChange: (e) => onChange({ matchCount: Number(e.target.value) }), className: "gm-select", children: MATCH_COUNTS$1.map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
          "Top ",
          n,
          " matches"
        ] }, n)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2 border-t border-[var(--color-border)]", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: gdpr, onChange: (e) => setGdpr(e.target.checked), className: "mt-1 accent-[var(--color-eu-blue-lighter)]", required: true }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--color-text-secondary)]", children: [
          "I consent to processing of my data to scan EU funding opportunities. ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: terms, onChange: (e) => setTerms(e.target.checked), className: "mt-1 accent-[var(--color-eu-blue-lighter)]", required: true }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--color-text-secondary)]", children: [
          "I have read and agree to the Terms and Conditions. ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onBack, disabled: isLoading, className: "gm-btn-secondary", children: "← Back" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: !valid || isLoading, className: "gm-btn-scan", children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-4 h-4", fill: "none", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })
        ] }),
        "Scanning…"
      ] }) : "🔍 Find My Grants" })
    ] })
  ] });
}
const STEP_LABELS = ["About You", "Your Profile"];
function ProfileMatchWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const { mutate, isPending, isError, error, data: matchData } = useGrantMatch("profile_match");
  function update(updates) {
    setData((prev) => ({ ...prev, ...updates }));
  }
  function handleSubmit() {
    mutate(data);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mb-2", children: STEP_LABELS.map((_, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `flex-1 h-[3px] rounded-full transition-colors ${i < step ? "bg-[var(--color-eu-blue-lighter)]" : i === step ? "bg-[var(--color-eu-blue-lighter)] opacity-80" : "bg-white/10"}`
      },
      i
    )) }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-muted)] mb-5", children: STEP_LABELS.map((label, i) => /* @__PURE__ */ jsxs("span", { children: [
      i > 0 && /* @__PURE__ */ jsx("span", { className: "mx-1.5", children: "→" }),
      /* @__PURE__ */ jsxs("span", { className: i === step ? "text-[var(--color-text-secondary)]" : i < step ? "line-through opacity-50" : "", children: [
        label,
        i < step ? " ✓" : ""
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-xl p-6", children: [
      step === 0 && /* @__PURE__ */ jsx(PMStep1, { data, onChange: update, onNext: () => setStep(1) }),
      step === 1 && /* @__PURE__ */ jsx(PMStep2, { data, onChange: update, onBack: () => setStep(0), onSubmit: handleSubmit, isLoading: isPending })
    ] }),
    isError && /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400", children: (error == null ? void 0 : error.message) ?? "Matching failed. Please try again." }),
    matchData && /* @__PURE__ */ jsx(MatchResults, { profile: data, results: matchData.results, filteredCalls: matchData.filteredCalls })
  ] });
}
function ProfileMatchPage() {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block bg-[color-mix(in_srgb,var(--color-eu-blue-lighter)_12%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4", children: "Profile-Based Matching · AI-Powered" }),
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3", children: [
        "EU Grants Matched to",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-eu-blue-lighter)]", children: "Your Profile" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[var(--color-text-secondary)] text-sm leading-relaxed", children: "Describe what you do and we'll find the best EU funding calls for you — no sector selection needed. Claude reads your profile and matches it against open calls." })
    ] }),
    /* @__PURE__ */ jsx(
      AuthGate,
      {
        title: "Sign in to run your profile match",
        description: "Create a free account to use AI-powered grant matching. It takes less than a minute.",
        children: /* @__PURE__ */ jsx(ProfileMatchWizard, {})
      }
    )
  ] });
}
const ORG_TYPES = ["Startup", "SME", "Non-profit / NGO", "Research Organisation", "Pre-incorporation / Solo Founder", "Other"];
const MATCH_COUNTS = [5, 10, 15];
function GrantSearchForm() {
  var _a;
  const { data: countries = [] } = useCountries();
  const { mutate, isPending, isError, error, data } = useGrantMatch("grant_search");
  const [profile, setProfile] = useState({
    matchCount: 5,
    // defaults so boolean filters pass
    stage: "MVP / Prototype",
    teamSize: "2-5",
    rdActivity: "Yes — active R&D",
    organisationType: "",
    countryOfTaxResidence: "",
    productDescription: ""
  });
  const valid = !!(profile.organisationType && profile.countryOfTaxResidence && ((_a = profile.productDescription) == null ? void 0 : _a.trim()));
  function update(updates) {
    setProfile((prev) => ({ ...prev, ...updates }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (valid) mutate(profile);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "glass-card rounded-xl p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
            "Organisation Type ",
            /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: profile.organisationType ?? "",
              onChange: (e) => update({ organisationType: e.target.value }),
              className: "gm-select",
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
                ORG_TYPES.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
            "Country ",
            /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: profile.countryOfTaxResidence ?? "",
              onChange: (e) => update({ countryOfTaxResidence: e.target.value }),
              className: "gm-select",
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
                countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
          "Tell us about your work ",
          /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            required: true,
            value: profile.productDescription ?? "",
            onChange: (e) => update({ productDescription: e.target.value }),
            className: "gm-textarea",
            placeholder: "Describe what you do, what problem you're solving, and what makes your work innovative. The more detail you provide, the better the grant match.",
            rows: 6
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-40", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Results" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: profile.matchCount ?? 5,
              onChange: (e) => update({ matchCount: Number(e.target.value) }),
              className: "gm-select",
              children: MATCH_COUNTS.map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                "Top ",
                n
              ] }, n))
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: !valid || isPending,
            className: "gm-btn-scan",
            children: isPending ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-4 h-4", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })
              ] }),
              "Searching…"
            ] }) : "🔍 Search Grants"
          }
        )
      ] })
    ] }) }),
    isError && /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400", children: (error == null ? void 0 : error.message) ?? "Search failed. Please try again." }),
    data && /* @__PURE__ */ jsx(MatchResults, { profile, results: data.results, filteredCalls: data.filteredCalls })
  ] });
}
function GrantSearchPage() {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block bg-[color-mix(in_srgb,var(--color-eu-blue)_20%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4", children: "Quick Search · AI-Powered" }),
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3", children: [
        "Find Grants You Can",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-eu-blue-lighter)]", children: "Apply For" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[var(--color-text-secondary)] text-sm leading-relaxed", children: "Tell us who you are and what you do. Claude will scan open EU funding calls and return the ones you're most likely to qualify for." })
    ] }),
    /* @__PURE__ */ jsx(
      AuthGate,
      {
        title: "Sign in to search for grants",
        description: "Create a free account to use AI-powered grant search. It takes less than a minute.",
        children: /* @__PURE__ */ jsx(GrantSearchForm, {})
      }
    )
  ] });
}
const ADMIN_EMAIL = "fredanaman@proton.me";
function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    async function fetchUsers() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to load users" }));
        setError(err.error);
      } else {
        const data = await res.json();
        setUsers(data.users);
      }
      setFetching(false);
    }
    fetchUsers();
  }, [user]);
  if (loading || !user || user.email !== ADMIN_EMAIL) return null;
  function fmt(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold px-3 py-1 mb-4", children: "Admin" }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight", children: "User Management" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-muted)] mt-1", children: "All registered accounts on CORDIS Explorer" })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mb-6", children: error }),
    fetching && !error ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--color-text-muted)] mb-3", children: [
        users.length,
        " account",
        users.length !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-[var(--color-border)] overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-[var(--color-border)] bg-white/[0.02]", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", children: "Email" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", children: "Joined" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", children: "Last sign in" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", children: "Confirmed" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: users.map((u, i) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: `border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`,
            children: [
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-[var(--color-text-primary)] font-mono text-xs", children: [
                u.email,
                u.email === ADMIN_EMAIL && /* @__PURE__ */ jsx("span", { className: "ml-2 text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-1.5 py-0.5", children: "admin" })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-[var(--color-text-muted)] text-xs", children: fmt(u.createdAt) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-[var(--color-text-muted)] text-xs", children: fmt(u.lastSignInAt) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs", children: u.confirmedAt ? /* @__PURE__ */ jsx("span", { className: "text-emerald-400", children: "✓ Yes" }) : /* @__PURE__ */ jsx("span", { className: "text-[var(--color-amber)]", children: "Pending" }) })
            ]
          },
          u.id
        )) })
      ] }) })
    ] })
  ] });
}
async function fetchMapData(programme) {
  var _a;
  const query = buildMapDataQuery(programme);
  const res = await fetch("/api/sparql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error("Failed to fetch map data");
  const json = await res.json();
  const bindings = ((_a = json.results) == null ? void 0 : _a.bindings) ?? [];
  return bindings.map((b) => {
    var _a2, _b, _c;
    return {
      country: ((_a2 = b.countryName) == null ? void 0 : _a2.value) ?? "",
      projectCount: parseInt(((_b = b.projectCount) == null ? void 0 : _b.value) ?? "0", 10),
      orgCount: parseInt(((_c = b.orgCount) == null ? void 0 : _c.value) ?? "0", 10)
    };
  }).filter((d) => d.country);
}
function useMapData(programme) {
  return useQuery({
    queryKey: ["map-data", programme ?? "all"],
    queryFn: () => fetchMapData(programme),
    staleTime: 1e3 * 60 * 30
  });
}
const CordisMap = lazy(() => import("./assets/CordisMap-Hy8cTXk-.js"));
const PROGRAMMES = [
  { value: void 0, label: "All Programmes" },
  { value: "HE", label: "Horizon Europe (2021+)" },
  { value: "H2020", label: "Horizon 2020 (2014–2020)" },
  { value: "FP7", label: "FP7 (2007–2013)" }
];
function Legend({ max }) {
  const steps = [0, 0.2, 0.4, 0.6, 0.8, 1];
  return /* @__PURE__ */ jsxs("div", { className: "absolute bottom-6 left-4 z-[1000] glass-card rounded-xl p-3 text-xs", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[var(--color-text-muted)] font-semibold mb-2 uppercase tracking-wider text-[10px]", children: "Projects" }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: steps.map((t) => {
      const count = Math.round(Math.pow(t, 2.5) * max);
      const r = Math.round(26 + t * (96 - 26));
      const g = Math.round(58 + t * (165 - 58));
      const b = Math.round(107 + t * (250 - 107));
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
        /* @__PURE__ */ jsx("div", { className: "w-6 h-4 rounded-sm", style: { background: t === 0 ? "#1e2235" : `rgb(${r},${g},${b})` } }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[var(--color-text-muted)]", children: t === 0 ? "0" : count >= 1e3 ? `${Math.round(count / 1e3)}k` : count })
      ] }, t);
    }) })
  ] });
}
function CountryPanel({ country, onClose }) {
  return /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 z-[1000] w-64 glass-card rounded-xl p-4 shadow-xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-[var(--color-text-primary)] text-base", children: country.country }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors ml-2 shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg bg-white/5 px-3 py-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--color-text-muted)]", children: "Project participations" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-[var(--color-eu-blue-lighter)] text-sm", children: country.projectCount.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg bg-white/5 px-3 py-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--color-text-muted)]", children: "Organisations" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-[var(--color-text-primary)] text-sm", children: country.orgCount.toLocaleString() })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: `/search?country=${encodeURIComponent(country.country)}`,
        className: "mt-3 block text-center text-xs font-semibold text-[var(--color-eu-blue-lighter)] border border-[var(--color-eu-blue-lighter)]/30 rounded-lg py-1.5 hover:bg-[var(--color-eu-blue-lighter)]/10 transition-colors no-underline",
        children: "Browse projects →"
      }
    )
  ] });
}
function MapPage() {
  const [programme, setProgramme] = useState(void 0);
  const [selected, setSelected] = useState(null);
  const [showBubbles, setShowBubbles] = useState(false);
  const { data = [], isLoading, error } = useMapData(programme);
  const max = Math.max(...data.map((d) => d.projectCount), 1);
  const top10 = [...data].sort((a, b) => b.projectCount - a.projectCount).slice(0, 10);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col", style: { height: "calc(100vh - 3.5rem)" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-sm font-bold text-[var(--color-text-primary)]", children: "Geographic Distribution" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--color-text-muted)]", children: "EU-funded project participations by country" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        PROGRAMMES.map((p) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setProgramme(p.value);
              setSelected(null);
            },
            className: `text-xs px-3 py-1.5 rounded-lg border transition-colors ${programme === p.value ? "bg-[var(--color-eu-blue)] border-[var(--color-eu-blue)] text-white" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)]"}`,
            children: p.label
          },
          String(p.value)
        )),
        /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-[var(--color-border)] mx-1" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowBubbles((b) => !b),
            className: `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${showBubbles ? "bg-blue-500/15 border-blue-500/40 text-blue-400" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)]"}`,
            children: [
              /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9", strokeWidth: 1.8 }),
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4", strokeWidth: 1.8 })
              ] }),
              "Bubbles"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", style: { minHeight: 0 }, children: [
        isLoading && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "Loading CORDIS data…" })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: "Failed to load map data" }) }),
        /* @__PURE__ */ jsx(Suspense, { fallback: null, children: !isLoading && !error && /* @__PURE__ */ jsx(
          CordisMap,
          {
            data,
            selected: (selected == null ? void 0 : selected.country) ?? null,
            onCountryClick: setSelected,
            showBubbles
          }
        ) }),
        !isLoading && /* @__PURE__ */ jsx(Legend, { max }),
        selected && /* @__PURE__ */ jsx(CountryPanel, { country: selected, onClose: () => setSelected(null) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-56 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-y-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "px-3 py-3 border-b border-[var(--color-border)]", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", children: "Top Countries" }) }),
        isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" }) }) : /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
          top10.map((d, i) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelected(d),
              className: `w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors ${(selected == null ? void 0 : selected.country) === d.country ? "bg-white/5" : ""}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[var(--color-text-muted)] w-4 shrink-0", children: i + 1 }),
                /* @__PURE__ */ jsx("span", { className: "flex-1 text-xs text-[var(--color-text-secondary)] truncate", children: d.country }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-[var(--color-eu-blue-lighter)] shrink-0", children: d.projectCount >= 1e3 ? `${(d.projectCount / 1e3).toFixed(0)}k` : d.projectCount })
              ]
            },
            d.country
          )),
          data.length > 10 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-[var(--color-text-muted)] px-3 py-2", children: [
            data.length - 10,
            " more countries"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        .leaflet-container { background: #0f1117; }
        .cordis-map-tooltip {
          background: rgba(15,17,23,0.95) !important;
          border: 1px solid rgba(59,130,246,0.3) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .cordis-map-tooltip .leaflet-tooltip-top::before,
        .cordis-map-tooltip::before { border-top-color: rgba(59,130,246,0.3) !important; }
        .leaflet-control-attribution { background: rgba(15,17,23,0.8) !important; color: #64748b !important; }
        .leaflet-control-attribution a { color: #94a3b8 !important; }
        .leaflet-bar a { background: rgba(30,34,53,0.95) !important; color: #94a3b8 !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-bar a:hover { background: rgba(59,130,246,0.2) !important; color: #f1f5f9 !important; }
      ` })
  ] });
}
async function postPartnerMatch(req) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session == null ? void 0 : session.access_token;
  const response = await fetch("/api/partner-match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...token ? { "Authorization": `Bearer ${token}` } : {}
    },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Partner match failed: ${response.status}`);
  }
  return response.json();
}
function usePartnerMatch() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: postPartnerMatch,
    onError: (err) => {
      if (err.message === "limit_exceeded") navigate("/pricing");
    }
  });
}
function ScoreBadge({ score }) {
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";
  const bg = score >= 80 ? "rgba(74,222,128,0.12)" : score >= 60 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shrink-0",
      style: { background: bg, color, border: `1px solid ${color}40` },
      children: [
        /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }),
        score,
        "%"
      ]
    }
  );
}
function PartnerCard$1({ result }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-2xl p-5 flex flex-col gap-3",
      style: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm leading-snug", style: { color: "var(--color-text-primary)" }, children: /* @__PURE__ */ jsx(
              Link,
              {
                to: `/org/${encodeURIComponent(result.orgName)}`,
                className: "text-[var(--color-eu-blue-lighter)] hover:underline",
                children: result.orgName
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: "var(--color-text-muted)" }, children: result.country }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", style: { color: "var(--color-text-muted)" }, children: "·" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs", style: { color: "var(--color-text-muted)" }, children: [
                result.projectCount,
                " CORDIS project",
                result.projectCount !== 1 ? "s" : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(ScoreBadge, { score: result.matchScore })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed", style: { color: "var(--color-text-secondary)" }, children: result.reason }),
        result.expertise.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: result.expertise.map((tag) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-[10px] font-medium rounded-full px-2 py-0.5",
            style: {
              background: "rgba(79,142,247,0.1)",
              color: "#7eb3ff",
              border: "1px solid rgba(79,142,247,0.2)"
            },
            children: tag
          },
          tag
        )) }),
        result.sampleProjects.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider mb-1.5", style: { color: "var(--color-text-muted)" }, children: "Sample projects" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: result.sampleProjects.map((p, i) => /* @__PURE__ */ jsxs("li", { className: "text-[11px] leading-snug truncate", style: { color: "var(--color-text-muted)" }, children: [
            "· ",
            p
          ] }, i)) })
        ] })
      ]
    }
  );
}
function PartnerMatchPage() {
  useEffect(() => {
    document.title = "Find EU Research Partners — CORDIS Explorer";
    return () => {
      document.title = "CORDIS Explorer — Search EU-Funded Research Projects";
    };
  }, []);
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [maxResults, setMaxResults] = useState(10);
  const [cluster, setCluster] = useState(null);
  const { data: countries = [] } = useCountries();
  const { mutate, data, isPending, error, reset } = usePartnerMatch();
  function handleSubmit(e) {
    e.preventDefault();
    if (description.trim().length < 20) return;
    const clusterContext = cluster && HE_CLUSTERS[cluster] ? `[Horizon Europe Cluster ${cluster}: ${HE_CLUSTERS[cluster].label}] ` : "";
    mutate({ description: clusterContext + description.trim(), country: country || void 0, maxResults });
  }
  return /* @__PURE__ */ jsx(AuthGate, { children: /* @__PURE__ */ jsx("div", { className: "min-h-screen px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4",
          style: {
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.25)",
            color: "#a78bfa"
          },
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" }) }),
            "AI-Powered · CORDIS Database"
          ]
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold tracking-tight mb-2", style: { color: "var(--color-text-primary)" }, children: "Partner Matchmaking" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "var(--color-text-muted)" }, children: "Describe your research project and find the best-fit EU consortium partners from the CORDIS database." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mb-8", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "rounded-xl p-4",
          style: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" },
          children: /* @__PURE__ */ jsx(
            ClusterBubbles,
            {
              selected: cluster,
              onChange: (v) => {
                setCluster(v);
                reset();
              },
              label: "Horizon Europe Cluster (optional)"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold mb-2 uppercase tracking-wider", style: { color: "var(--color-text-muted)" }, children: "Project Description *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: description,
            onChange: (e) => {
              setDescription(e.target.value);
              reset();
            },
            rows: 5,
            placeholder: "Describe your research project, technology area, and what kind of partners you're looking for…",
            className: "w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none",
            style: {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--color-text-primary)"
            },
            required: true,
            minLength: 20
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] mt-1", style: { color: description.length < 20 && description.length > 0 ? "#f87171" : "var(--color-text-muted)" }, children: [
          description.length,
          " / 20 characters minimum"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold mb-2 uppercase tracking-wider", style: { color: "var(--color-text-muted)" }, children: "Partner Country (optional)" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: country,
              onChange: (e) => setCountry(e.target.value),
              className: "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none",
              style: {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: country ? "var(--color-text-primary)" : "var(--color-text-muted)"
              },
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Any country" }),
                countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold mb-2 uppercase tracking-wider", style: { color: "var(--color-text-muted)" }, children: "Number of Results" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: maxResults,
              onChange: (e) => setMaxResults(Number(e.target.value)),
              className: "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none",
              style: {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--color-text-primary)"
              },
              children: [5, 10, 15].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                n,
                " partners"
              ] }, n))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isPending || description.trim().length < 20,
          className: "w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
          style: {
            background: isPending || description.trim().length < 20 ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white",
            cursor: isPending || description.trim().length < 20 ? "not-allowed" : "pointer"
          },
          children: isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" }),
            "Searching CORDIS & scoring with Claude…"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" }) }),
            "Find Partners"
          ] })
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx(
      "div",
      {
        className: "rounded-xl px-4 py-3 mb-6 text-sm",
        style: { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#fca5a5" },
        children: error.message
      }
    ),
    data && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-bold text-base", style: { color: "var(--color-text-primary)" }, children: [
          data.results.length,
          " Partner",
          data.results.length !== 1 ? "s" : "",
          " Found"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs mt-0.5", style: { color: "var(--color-text-muted)" }, children: [
          "Scored from ",
          data.totalCandidates,
          " organisations · keywords: ",
          data.keywords.join(", ")
        ] })
      ] }) }),
      data.results.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12", style: { color: "var(--color-text-muted)" }, children: /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No matching partners found. Try broadening your description." }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: data.results.map((result, i) => /* @__PURE__ */ jsx(PartnerCard$1, { result }, i)) })
    ] })
  ] }) }) });
}
async function fetchPartnerSearch(filters) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session == null ? void 0 : session.access_token;
  const params = new URLSearchParams();
  if (filters.callId) params.set("callId", filters.callId);
  if (filters.cluster) params.set("cluster", filters.cluster);
  if (filters.country) params.set("country", filters.country);
  params.set("page", String(filters.page));
  const response = await fetch(`/api/partner-search-hub?${params}`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Partner search failed: ${response.status}`);
  }
  return response.json();
}
function usePartnerSearch(filters) {
  return useQuery({
    queryKey: ["partnerSearch", filters],
    queryFn: () => fetchPartnerSearch(filters),
    placeholderData: keepPreviousData,
    enabled: !!(filters.callId || filters.cluster || filters.country),
    staleTime: 1e3 * 60 * 15
  });
}
const PAGE_SIZE$1 = 20;
function PartnerCard({ profile }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3 hover:border-[var(--color-eu-blue-lighter)] transition-colors", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-[var(--color-text-primary)] text-sm", children: profile.orgName }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mt-0.5", children: profile.country })
      ] }),
      profile.projectCount > 0 && /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20", children: [
        profile.projectCount,
        " EU projects"
      ] })
    ] }),
    profile.expertise.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: profile.expertise.slice(0, 5).map((tag) => /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)]", children: tag }, tag)) }),
    profile.recentProjects && profile.recentProjects.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-[var(--color-border)] space-y-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-[var(--color-text-secondary)]", children: "Recent projects:" }),
      /* @__PURE__ */ jsx("ul", { className: "text-xs text-[var(--color-text-secondary)] space-y-0.5 list-disc list-inside", children: profile.recentProjects.map((t, i) => /* @__PURE__ */ jsx("li", { className: "truncate", children: t }, i)) })
    ] }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: profile.ftPortalUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "inline-flex items-center gap-1 text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline",
        children: "Find on F&T Portal →"
      }
    )
  ] });
}
function PartnerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: countries = [] } = useCountries();
  const [filters, setFilters] = useState({
    callId: searchParams.get("callId") ?? "",
    cluster: searchParams.get("cluster") ?? void 0,
    country: searchParams.get("country") ?? void 0,
    page: parseInt(searchParams.get("page") ?? "1", 10)
  });
  const [callInput, setCallInput] = useState(filters.callId ?? "");
  const { data, isLoading, error } = usePartnerSearch(filters);
  const saveHistory = useSaveHistory();
  const savedKeyRef = useRef("");
  useEffect(() => {
    const partners = (data == null ? void 0 : data.partners) ?? [];
    if (!filters.callId || partners.length === 0) return;
    const key = JSON.stringify(filters);
    if (savedKeyRef.current === key) return;
    savedKeyRef.current = key;
    saveHistory.mutate({
      query_type: "partner_search",
      query_params: { callId: filters.callId, country: filters.country, cluster: filters.cluster },
      result_count: partners.length,
      results_snapshot: partners.slice(0, 8).map((p) => ({ orgName: p.orgName, country: p.country, projectCount: p.projectCount }))
    });
  }, [data, filters.callId]);
  useEffect(() => {
    document.title = "Partner Search — CORDIS Explorer";
  }, []);
  function applyFilters(updates) {
    const next = { ...filters, ...updates, page: 1 };
    setFilters(next);
    const params = {};
    if (next.callId) params.callId = next.callId;
    if (next.cluster) params.cluster = next.cluster;
    if (next.country) params.country = next.country;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params, { replace: true });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)] mb-2", children: "Partner Search Hub" }),
      /* @__PURE__ */ jsx("p", { className: "text-[var(--color-text-secondary)] text-sm", children: "Find organisations with a proven track record in EU research projects. Filter by Horizon Europe cluster or call reference." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-[200px]", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Call reference (e.g. HORIZON-CL4-2026-TWIN-01)",
            value: callInput,
            onChange: (e) => setCallInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") applyFilters({ callId: callInput });
            },
            className: "w-full px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
          }
        ) }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filters.country ?? "",
            onChange: (e) => applyFilters({ country: e.target.value || void 0 }),
            className: "px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All countries" }),
              countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => applyFilters({ callId: callInput }),
            className: "px-4 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity",
            children: "Search"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        ClusterBubbles,
        {
          selected: filters.cluster ?? null,
          onChange: (v) => applyFilters({ cluster: v ?? void 0 }),
          label: "Filter by Horizon Europe Cluster"
        }
      )
    ] }),
    isLoading && /* @__PURE__ */ jsx(Spinner, {}),
    error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm", children: error.message }),
    !isLoading && data && /* @__PURE__ */ jsxs(Fragment, { children: [
      data.callTitle && /* @__PURE__ */ jsxs("p", { className: "text-sm text-[var(--color-text-secondary)] mb-4", children: [
        "Call: ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-text-primary)] font-medium", children: data.callTitle })
      ] }),
      data.profiles.length === 0 ? /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No active partnership requests found",
          description: "No profiles match your filters. Post yours on the F&T Portal to get started."
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: data.profiles.map((p) => /* @__PURE__ */ jsx(PartnerCard, { profile: p }, p.id)) }),
        /* @__PURE__ */ jsx(
          Pagination,
          {
            page: filters.page,
            pageSize: PAGE_SIZE$1,
            resultCount: data.profiles.length,
            onPageChange: (p) => {
              const next = { ...filters, page: p };
              setFilters(next);
              setSearchParams(
                Object.fromEntries(
                  Object.entries({
                    callId: next.callId,
                    cluster: next.cluster,
                    country: next.country,
                    page: String(p)
                  }).filter(([, v]) => v)
                ),
                { replace: true }
              );
            }
          }
        )
      ] })
    ] })
  ] });
}
const PLANS = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    description: "Explore EU funding with AI-powered matching",
    features: ["5 AI queries/month", "All 4 matching tools", "Browse CORDIS projects"],
    cta: "Get started",
    ctaAction: "signup"
  },
  {
    name: "Pro",
    price: "€29",
    period: "/month",
    annualPrice: "€290/year",
    annualSaving: "Save €58",
    description: "For researchers and SMEs applying for grants",
    features: ["100 AI queries/month", "All 4 matching tools", "Priority support", "Export results"],
    highlight: true,
    cta: "Upgrade to Pro",
    ctaAction: "contact"
  },
  {
    name: "Team",
    price: "€99",
    period: "/month",
    annualPrice: "€990/year",
    annualSaving: "Save €198",
    description: "For consultancies and grant offices",
    features: ["500 AI queries/month", "Up to 5 team members", "All 4 matching tools", "Dedicated support", "API access"],
    cta: "Contact us",
    ctaAction: "contact"
  }
];
function CreditsPage() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [contactForm, setContactForm] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  function handleCta(plan) {
    if (plan.ctaAction === "signup") {
      if (user) navigate("/");
      else openAuthModal();
    } else {
      setContactForm({ plan: plan.name, email: (user == null ? void 0 : user.email) ?? "", org: "" });
      setSubmitted(false);
    }
  }
  function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactForm) return;
    const subject = encodeURIComponent(`CORDIS Explorer ${contactForm.plan} — Upgrade request`);
    const body = encodeURIComponent(
      `Hi,

I'd like to upgrade to the ${contactForm.plan} plan.

Organisation: ${contactForm.org}
Email: ${contactForm.email}

Thanks`
    );
    window.location.href = `mailto:hello@cordis-explorer.eu?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen px-4 py-14", style: { background: "#ffffff" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx(
        "h1",
        {
          className: "text-4xl font-bold tracking-tight mb-3",
          style: { color: "#222222", letterSpacing: "-0.44px" },
          children: "Unlock unlimited grant matching"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-base max-w-lg mx-auto mb-6", style: { color: "#6a6a6a" }, children: "Find the right EU funding calls for your research. Every plan includes all four AI-powered matching tools." }),
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 text-sm", children: [
        /* @__PURE__ */ jsx("span", { style: { color: annual ? "#aaaaaa" : "#222222", fontWeight: annual ? 400 : 600 }, children: "Monthly" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setAnnual(!annual),
            className: "relative w-11 h-6 rounded-full border-0 cursor-pointer transition-colors duration-200",
            style: { background: annual ? "#ff385c" : "#dddddd" },
            "aria-label": "Toggle annual billing",
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200",
                style: { left: 2, transform: annual ? "translateX(20px)" : "translateX(0)" }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("span", { style: { color: annual ? "#222222" : "#aaaaaa", fontWeight: annual ? 600 : 400 }, children: [
          "Annual",
          /* @__PURE__ */ jsx("span", { className: "ml-1.5 text-xs font-bold", style: { color: "#ff385c" }, children: "Save 2 months" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "rounded-2xl p-5 mb-10 flex flex-wrap gap-4 justify-center",
        style: { background: "#f7f7f7", border: "1px solid #ebebeb" },
        children: [
          { label: "Grant Search", icon: "🔍" },
          { label: "Profile Match", icon: "🧠" },
          { label: "GrantMatch Wizard", icon: "✅" },
          { label: "Partner Matchmaking", icon: "🤝" }
        ].map((t) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", style: { color: "#484848" }, children: [
          /* @__PURE__ */ jsx("span", { children: t.icon }),
          /* @__PURE__ */ jsx("span", { children: t.label })
        ] }, t.label))
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10", children: PLANS.map((plan) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative rounded-2xl p-7 flex flex-col",
        style: {
          background: "#ffffff",
          border: plan.highlight ? "2px solid #ff385c" : "1px solid #ebebeb",
          boxShadow: plan.highlight ? "rgba(255,56,92,0.12) 0px 0px 0px 4px, rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 16px" : "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px"
        },
        children: [
          plan.highlight && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold rounded-full px-3 py-1",
              style: { background: "#ff385c", color: "#ffffff" },
              children: "MOST POPULAR"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wider mb-2", style: { color: "#6a6a6a" }, children: plan.name }),
            /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-1 mb-1", children: annual && plan.annualPrice ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold", style: { color: "#222222", letterSpacing: "-0.44px" }, children: plan.annualPrice.replace("/year", "") }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: "#6a6a6a" }, children: "/year" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold", style: { color: "#222222", letterSpacing: "-0.44px" }, children: plan.price }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: "#6a6a6a" }, children: plan.period })
            ] }) }),
            annual && plan.annualSaving && /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold", style: { color: "#16a34a" }, children: plan.annualSaving }),
            /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", style: { color: "#6a6a6a" }, children: plan.description })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2.5 flex-1 mb-6", children: plan.features.map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2.5 text-sm", style: { color: "#484848" }, children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                style: { background: plan.highlight ? "#ff385c" : "#f2f2f2" },
                children: /* @__PURE__ */ jsx("svg", { className: "w-2.5 h-2.5", fill: "none", stroke: plan.highlight ? "#ffffff" : "#484848", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" }) })
              }
            ),
            f
          ] }, f)) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-0",
              style: plan.highlight ? { background: "#222222", color: "#ffffff" } : { background: "#f2f2f2", color: "#222222" },
              onClick: () => handleCta(plan),
              children: plan.cta
            }
          )
        ]
      },
      plan.name
    )) }),
    contactForm && !submitted && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        style: { background: "rgba(0,0,0,0.4)" },
        onClick: (e) => {
          if (e.target === e.currentTarget) setContactForm(null);
        },
        children: /* @__PURE__ */ jsxs(
          "form",
          {
            onSubmit: handleContactSubmit,
            className: "rounded-2xl p-8 w-full max-w-md mx-4",
            style: { background: "#ffffff", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" },
            children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold mb-1", style: { color: "#222222" }, children: [
                "Upgrade to ",
                contactForm.plan
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm mb-5", style: { color: "#6a6a6a" }, children: "We'll follow up within 24 hours to get you set up." }),
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold mb-1.5", style: { color: "#484848" }, children: "Work email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  required: true,
                  value: contactForm.email,
                  onChange: (e) => setContactForm({ ...contactForm, email: e.target.value }),
                  className: "w-full rounded-lg px-3 py-2.5 text-sm mb-4",
                  style: { border: "1px solid #dddddd", outline: "none", background: "#fafafa" },
                  placeholder: "you@organisation.eu"
                }
              ),
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold mb-1.5", style: { color: "#484848" }, children: "Organisation name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: contactForm.org,
                  onChange: (e) => setContactForm({ ...contactForm, org: e.target.value }),
                  className: "w-full rounded-lg px-3 py-2.5 text-sm mb-6",
                  style: { border: "1px solid #dddddd", outline: "none", background: "#fafafa" },
                  placeholder: "Your university or company"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setContactForm(null),
                    className: "flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-0",
                    style: { background: "#f2f2f2", color: "#484848" },
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    className: "flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-0",
                    style: { background: "#ff385c", color: "#ffffff" },
                    children: "Send request"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    submitted && /* @__PURE__ */ jsxs("div", { className: "text-center rounded-2xl p-8 mb-10", style: { background: "#f0fdf4", border: "1px solid #bbf7d0" }, children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold mb-1", style: { color: "#166534" }, children: "Request sent" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", style: { color: "#15803d" }, children: [
        "We'll be in touch at ",
        contactForm == null ? void 0 : contactForm.email,
        " within 24 hours."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "text-sm font-medium hover:underline cursor-pointer bg-transparent border-0",
          style: { color: "#6a6a6a" },
          children: "← Go back"
        }
      ),
      !user && /* @__PURE__ */ jsxs("p", { className: "text-xs mt-3", style: { color: "#aaaaaa" }, children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/", className: "underline font-medium", style: { color: "#ff385c" }, children: "Sign in" })
      ] })
    ] })
  ] }) });
}
const RADIUS = 13;
const COLORS = {
  org: "#4f8ef7",
  project: "#4ade80",
  country: "#fbbf24"
};
const BG_COLORS = {
  org: "rgba(79,142,247,0.14)",
  project: "rgba(74,222,128,0.14)",
  country: "rgba(251,191,36,0.14)"
};
function ForceGraph({ nodes, edges, selectedNodeId, onNodeClick }) {
  const canvasRef = useRef(null);
  const simRef = useRef({
    nodes: [],
    edges: [],
    alpha: 1,
    panX: 0,
    panY: 0,
    scale: 1,
    dragging: false,
    dragX: 0,
    dragY: 0,
    lastPanX: 0,
    lastPanY: 0,
    selectedId: void 0
  });
  const rafRef = useRef();
  useEffect(() => {
    const existing = new Map(simRef.current.nodes.map((n) => [n.id, n]));
    simRef.current.nodes = nodes.map((n) => {
      if (existing.has(n.id)) return { ...existing.get(n.id), ...n };
      const connEdge = edges.find((e) => e.source === n.id || e.target === n.id);
      const nbr = connEdge ? existing.get(connEdge.source === n.id ? connEdge.target : connEdge.source) : void 0;
      return {
        ...n,
        x: ((nbr == null ? void 0 : nbr.x) ?? 0) + (Math.random() - 0.5) * 100,
        y: ((nbr == null ? void 0 : nbr.y) ?? 0) + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0
      };
    });
    simRef.current.edges = edges;
    simRef.current.alpha = Math.min(simRef.current.alpha + 0.4, 1);
  }, [nodes, edges]);
  useEffect(() => {
    simRef.current.selectedId = selectedNodeId;
  }, [selectedNodeId]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    function tick() {
      const sim = simRef.current;
      const { nodes: nodes2, edges: edges2, alpha } = sim;
      const W = canvas.width;
      const H = canvas.height;
      if (nodes2.length > 1 && alpha > 2e-3) {
        const REPULSION = 3500;
        const IDEAL = 140;
        const SPRING = 0.055;
        const DAMP = 0.8;
        const fx = new Float64Array(nodes2.length);
        const fy = new Float64Array(nodes2.length);
        for (let i = 0; i < nodes2.length; i++) {
          for (let j = i + 1; j < nodes2.length; j++) {
            const dx = nodes2[i].x - nodes2[j].x;
            const dy = nodes2[i].y - nodes2[j].y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = REPULSION / (d * d);
            fx[i] += dx / d * f;
            fy[i] += dy / d * f;
            fx[j] -= dx / d * f;
            fy[j] -= dy / d * f;
          }
        }
        const idx = new Map(nodes2.map((n, i) => [n.id, i]));
        for (const e of edges2) {
          const si = idx.get(e.source);
          const ti = idx.get(e.target);
          if (si === void 0 || ti === void 0) continue;
          const dx = nodes2[ti].x - nodes2[si].x;
          const dy = nodes2[ti].y - nodes2[si].y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const stretch = (d - IDEAL) * SPRING;
          const f = stretch;
          fx[si] += dx / d * f;
          fy[si] += dy / d * f;
          fx[ti] -= dx / d * f;
          fy[ti] -= dy / d * f;
        }
        const cx = nodes2.reduce((s, n) => s + n.x, 0) / nodes2.length;
        const cy = nodes2.reduce((s, n) => s + n.y, 0) / nodes2.length;
        for (let i = 0; i < nodes2.length; i++) {
          fx[i] -= (nodes2[i].x - cx) * 0.01;
          fy[i] -= (nodes2[i].y - cy) * 0.01;
          nodes2[i].vx = (nodes2[i].vx + fx[i] * alpha) * DAMP;
          nodes2[i].vy = (nodes2[i].vy + fy[i] * alpha) * DAMP;
          nodes2[i].x += nodes2[i].vx;
          nodes2[i].y += nodes2[i].vy;
        }
        sim.alpha *= 0.98;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2 + sim.panX, H / 2 + sim.panY);
      ctx.scale(sim.scale, sim.scale);
      const idx2 = new Map(nodes2.map((n, i) => [n.id, i]));
      ctx.strokeStyle = "rgba(100,100,120,0.18)";
      ctx.lineWidth = 1;
      for (const e of edges2) {
        const si = idx2.get(e.source);
        const ti = idx2.get(e.target);
        if (si === void 0 || ti === void 0) continue;
        const s = nodes2[si];
        const t = nodes2[ti];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
      for (const node of nodes2) {
        const color = COLORS[node.type] ?? "#888";
        const bg = BG_COLORS[node.type] ?? "rgba(255,255,255,0.1)";
        const sel = node.id === sim.selectedId;
        if (sel) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, RADIUS + 9, 0, Math.PI * 2);
          ctx.fillStyle = bg;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = sel ? color : bg;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = sel ? 2.5 : 1.5;
        ctx.stroke();
        if (!node.expanded && node.type !== "country") {
          ctx.fillStyle = color;
          ctx.font = `bold ${sel ? 11 : 10}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("+", node.x, node.y);
        }
        const raw = node.label;
        const lbl = raw.length > 24 ? raw.slice(0, 22) + "…" : raw;
        ctx.font = `${sel ? "bold " : ""}10.5px sans-serif`;
        ctx.fillStyle = sel ? color : "rgba(40,40,60,0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(lbl, node.x, node.y + RADIUS + 4);
      }
      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);
  const nodeAt = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sim = simRef.current;
    const mx = (clientX - rect.left - canvas.width / 2 - sim.panX) / sim.scale;
    const my = (clientY - rect.top - canvas.height / 2 - sim.panY) / sim.scale;
    for (const n of sim.nodes) {
      if (Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2) <= RADIUS + 6) return n;
    }
    return null;
  }, []);
  const onMouseDown = useCallback((e) => {
    const s = simRef.current;
    s.dragging = true;
    s.dragX = e.clientX;
    s.dragY = e.clientY;
    s.lastPanX = s.panX;
    s.lastPanY = s.panY;
  }, []);
  const onMouseMove = useCallback((e) => {
    const s = simRef.current;
    if (!s.dragging) return;
    s.panX = s.lastPanX + e.clientX - s.dragX;
    s.panY = s.lastPanY + e.clientY - s.dragY;
  }, []);
  const onMouseUp = useCallback((e) => {
    const s = simRef.current;
    const moved = Math.abs(e.clientX - s.dragX) + Math.abs(e.clientY - s.dragY) > 5;
    s.dragging = false;
    if (!moved) {
      const n = nodeAt(e.clientX, e.clientY);
      if (n) onNodeClick(n);
    }
  }, [nodeAt, onNodeClick]);
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const s = simRef.current;
    s.scale = Math.max(0.15, Math.min(5, s.scale * (e.deltaY > 0 ? 0.9 : 1.11)));
  }, []);
  return /* @__PURE__ */ jsx(
    "canvas",
    {
      ref: canvasRef,
      className: "w-full h-full",
      style: { cursor: "grab" },
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: () => {
        simRef.current.dragging = false;
      },
      onWheel
    }
  );
}
function getVal(b, key) {
  var _a;
  return (_a = b[key]) == null ? void 0 : _a.value;
}
function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).getFullYear().toString();
  } catch {
    return null;
  }
}
function connectedNodes(nodeId, filterType, nodes, edges) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return edges.map((e) => {
    const otherId = e.source === nodeId ? e.target : e.target === nodeId ? e.source : null;
    return otherId ? nodeMap.get(otherId) : void 0;
  }).filter((n) => !!n && n.type === filterType);
}
async function fetchOrgProjects(orgName) {
  const data = await executeSparql(buildOrgProjectsForGraphQuery(orgName));
  return data.results.bindings.map((b) => ({
    title: getVal(b, "projectTitle") ?? "",
    acronym: getVal(b, "projectAcronym"),
    projectId: getVal(b, "projectId"),
    startDate: getVal(b, "startDate")
  })).filter((p) => p.title);
}
function HeroGraphAnimation() {
  return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none select-none", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx("div", { className: "absolute hero-node-a", style: { top: "12%", left: "8%" }, children: /* @__PURE__ */ jsxs("svg", { width: "120", height: "90", viewBox: "0 0 120 90", fill: "none", children: [
      /* @__PURE__ */ jsx("line", { x1: "20", y1: "20", x2: "100", y2: "65", stroke: "#ff385c", strokeWidth: "1.5", strokeOpacity: "0.18", strokeDasharray: "6 4" }),
      /* @__PURE__ */ jsx("circle", { cx: "20", cy: "20", r: "10", fill: "#ff385c", fillOpacity: "0.12", stroke: "#ff385c", strokeOpacity: "0.3", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "100", cy: "65", r: "7", fill: "#2563eb", fillOpacity: "0.1", stroke: "#2563eb", strokeOpacity: "0.25", strokeWidth: "1.5" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute hero-node-b", style: { top: "8%", right: "10%" }, children: /* @__PURE__ */ jsxs("svg", { width: "160", height: "120", viewBox: "0 0 160 120", fill: "none", children: [
      /* @__PURE__ */ jsx("line", { x1: "80", y1: "20", x2: "20", y2: "90", stroke: "#2563eb", strokeWidth: "1.5", strokeOpacity: "0.15", strokeDasharray: "5 5" }),
      /* @__PURE__ */ jsx("line", { x1: "80", y1: "20", x2: "140", y2: "80", stroke: "#d97706", strokeWidth: "1.5", strokeOpacity: "0.15", strokeDasharray: "5 5" }),
      /* @__PURE__ */ jsx("circle", { cx: "80", cy: "20", r: "12", fill: "#ff385c", fillOpacity: "0.1", stroke: "#ff385c", strokeOpacity: "0.28", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "20", cy: "90", r: "8", fill: "#d97706", fillOpacity: "0.1", stroke: "#d97706", strokeOpacity: "0.25", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "140", cy: "80", r: "8", fill: "#2563eb", fillOpacity: "0.1", stroke: "#2563eb", strokeOpacity: "0.25", strokeWidth: "1.5" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute hero-node-c", style: { bottom: "15%", left: "5%" }, children: /* @__PURE__ */ jsxs("svg", { width: "140", height: "100", viewBox: "0 0 140 100", fill: "none", children: [
      /* @__PURE__ */ jsx("line", { x1: "20", y1: "50", x2: "120", y2: "30", stroke: "#16a34a", strokeWidth: "1.5", strokeOpacity: "0.15", strokeDasharray: "6 4" }),
      /* @__PURE__ */ jsx("line", { x1: "20", y1: "50", x2: "90", y2: "85", stroke: "#ff385c", strokeWidth: "1.5", strokeOpacity: "0.12", strokeDasharray: "6 4" }),
      /* @__PURE__ */ jsx("circle", { cx: "20", cy: "50", r: "9", fill: "#2563eb", fillOpacity: "0.1", stroke: "#2563eb", strokeOpacity: "0.25", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "120", cy: "30", r: "7", fill: "#16a34a", fillOpacity: "0.1", stroke: "#16a34a", strokeOpacity: "0.2", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "90", cy: "85", r: "7", fill: "#16a34a", fillOpacity: "0.1", stroke: "#16a34a", strokeOpacity: "0.2", strokeWidth: "1.5" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute hero-node-a", style: { bottom: "18%", right: "8%", animationDelay: "3s" }, children: /* @__PURE__ */ jsxs("svg", { width: "130", height: "110", viewBox: "0 0 130 110", fill: "none", children: [
      /* @__PURE__ */ jsx("line", { x1: "65", y1: "20", x2: "20", y2: "80", stroke: "#d97706", strokeWidth: "1.5", strokeOpacity: "0.18", strokeDasharray: "5 5" }),
      /* @__PURE__ */ jsx("line", { x1: "65", y1: "20", x2: "110", y2: "75", stroke: "#2563eb", strokeWidth: "1.5", strokeOpacity: "0.15", strokeDasharray: "5 5" }),
      /* @__PURE__ */ jsx("circle", { cx: "65", cy: "20", r: "11", fill: "#d97706", fillOpacity: "0.1", stroke: "#d97706", strokeOpacity: "0.28", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "20", cy: "80", r: "7", fill: "#ff385c", fillOpacity: "0.1", stroke: "#ff385c", strokeOpacity: "0.22", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "110", cy: "75", r: "7", fill: "#ff385c", fillOpacity: "0.1", stroke: "#ff385c", strokeOpacity: "0.22", strokeWidth: "1.5" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute hero-node-b", style: { top: "38%", left: "50%", transform: "translateX(-50%)", animationDelay: "5s" }, children: /* @__PURE__ */ jsxs("svg", { width: "200", height: "160", viewBox: "0 0 200 160", fill: "none", children: [
      /* @__PURE__ */ jsx("line", { x1: "100", y1: "80", x2: "30", y2: "30", stroke: "#ff385c", strokeWidth: "1", strokeOpacity: "0.08" }),
      /* @__PURE__ */ jsx("line", { x1: "100", y1: "80", x2: "170", y2: "25", stroke: "#2563eb", strokeWidth: "1", strokeOpacity: "0.08" }),
      /* @__PURE__ */ jsx("line", { x1: "100", y1: "80", x2: "50", y2: "135", stroke: "#d97706", strokeWidth: "1", strokeOpacity: "0.08" }),
      /* @__PURE__ */ jsx("line", { x1: "100", y1: "80", x2: "160", y2: "130", stroke: "#16a34a", strokeWidth: "1", strokeOpacity: "0.08" }),
      /* @__PURE__ */ jsx("circle", { cx: "100", cy: "80", r: "18", fill: "#ff385c", fillOpacity: "0.04", stroke: "#ff385c", strokeOpacity: "0.12", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "30", cy: "30", r: "6", fill: "#2563eb", fillOpacity: "0.06", stroke: "#2563eb", strokeOpacity: "0.15", strokeWidth: "1" }),
      /* @__PURE__ */ jsx("circle", { cx: "170", cy: "25", r: "6", fill: "#2563eb", fillOpacity: "0.06", stroke: "#2563eb", strokeOpacity: "0.15", strokeWidth: "1" }),
      /* @__PURE__ */ jsx("circle", { cx: "50", cy: "135", r: "6", fill: "#d97706", fillOpacity: "0.06", stroke: "#d97706", strokeOpacity: "0.15", strokeWidth: "1" }),
      /* @__PURE__ */ jsx("circle", { cx: "160", cy: "130", r: "6", fill: "#16a34a", fillOpacity: "0.06", stroke: "#16a34a", strokeOpacity: "0.15", strokeWidth: "1" })
    ] }) })
  ] });
}
function KnowledgeGraphPage() {
  var _a, _b, _c, _d, _e;
  useEffect(() => {
    document.title = "EU Research Knowledge Graph — CORDIS Explorer";
    return () => {
      document.title = "CORDIS Explorer — Search EU-Funded Research Projects";
    };
  }, []);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sidebarProjects, setSidebarProjects] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [mode, setMode] = useState("org");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [projectResults, setProjectResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: countries = [] } = useCountries();
  const debounceRef = useRef();
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (mode !== "org") return;
    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await executeSparql(buildOrgSearchForGraphQuery(searchTerm.trim()));
        const results = data.results.bindings.map((b) => ({
          name: getVal(b, "orgName") ?? "",
          count: parseInt(getVal(b, "projectCount") ?? "0", 10)
        })).filter((r) => r.name);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 420);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, mode]);
  useEffect(() => {
    if (mode !== "project") return;
    if (searchTerm.trim().length < 3) {
      setProjectResults([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await executeSparql(buildProjectSearchForGraphQuery(searchTerm.trim()));
        const results = data.results.bindings.map((b) => ({
          title: getVal(b, "projectTitle") ?? "",
          acronym: getVal(b, "projectAcronym"),
          projectId: getVal(b, "projectId") ?? ""
        })).filter((r) => r.title && r.projectId);
        setProjectResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setProjectResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 420);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, mode]);
  useEffect(() => {
    function handler(e) {
      var _a2;
      if (!((_a2 = dropdownRef.current) == null ? void 0 : _a2.contains(e.target))) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  function addNodes(newNodes, newEdges) {
    setNodes((prev) => {
      const ids = new Set(prev.map((n) => n.id));
      return [...prev, ...newNodes.filter((n) => !ids.has(n.id))];
    });
    setEdges((prev) => {
      const keys = new Set(prev.map((e) => `${e.source}->${e.target}`));
      return [...prev, ...newEdges.filter((e) => !keys.has(`${e.source}->${e.target}`))];
    });
  }
  function markExpanded(nodeId) {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, expanded: true } : n));
    setSelected((s) => (s == null ? void 0 : s.id) === nodeId ? { ...s, expanded: true } : s);
  }
  async function loadOrg(orgName) {
    setShowDropdown(false);
    setSearchTerm(orgName);
    setExpandLoading(true);
    const orgId = `org:${orgName}`;
    try {
      const data = await executeSparql(buildOrgProjectsForGraphQuery(orgName));
      const bindings = data.results.bindings;
      const newNodes = [{ id: orgId, label: orgName, type: "org", expanded: true }];
      const newEdges = [];
      const seen = /* @__PURE__ */ new Set();
      for (const b of bindings) {
        const title = getVal(b, "projectTitle") ?? "";
        const acronym = getVal(b, "projectAcronym");
        const projectId = getVal(b, "projectId");
        const startDate = getVal(b, "startDate");
        if (!title) continue;
        const nodeId = `project:${projectId ?? title}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({
          id: nodeId,
          label: acronym ?? (title.length > 30 ? title.slice(0, 28) + "…" : title),
          type: "project",
          expanded: true,
          meta: { projectId, title, startDate, acronym }
        });
        newEdges.push({ source: orgId, target: nodeId });
      }
      setNodes(newNodes);
      setEdges(newEdges);
      setSelected({ id: orgId, label: orgName, type: "org", expanded: true });
      setSidebarProjects(newNodes.filter((n) => n.type === "project").map((n) => {
        var _a2, _b2, _c2, _d2;
        return {
          title: ((_a2 = n.meta) == null ? void 0 : _a2.title) ?? n.label,
          acronym: (_b2 = n.meta) == null ? void 0 : _b2.acronym,
          projectId: (_c2 = n.meta) == null ? void 0 : _c2.projectId,
          startDate: (_d2 = n.meta) == null ? void 0 : _d2.startDate
        };
      }));
    } finally {
      setExpandLoading(false);
    }
  }
  async function loadCountry(countryName) {
    setExpandLoading(true);
    const countryId = `country:${countryName}`;
    try {
      const data = await executeSparql(buildCountryOrgsForGraphQuery(countryName));
      const bindings = data.results.bindings;
      const newNodes = [{ id: countryId, label: countryName, type: "country", expanded: true }];
      const newEdges = [];
      const seen = /* @__PURE__ */ new Set();
      for (const b of bindings) {
        const orgName = getVal(b, "orgName") ?? "";
        const count = parseInt(getVal(b, "projectCount") ?? "0", 10);
        if (!orgName) continue;
        const nodeId = `org:${orgName}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({ id: nodeId, label: orgName, type: "org", expanded: false, meta: { country: countryName, projectCount: String(count) } });
        newEdges.push({ source: countryId, target: nodeId });
      }
      setNodes(newNodes);
      setEdges(newEdges);
      setSelected({ id: countryId, label: countryName, type: "country", expanded: true });
    } finally {
      setExpandLoading(false);
    }
  }
  async function loadProject(projectId, projectTitle, projectAcronym) {
    setShowDropdown(false);
    setSearchTerm(projectAcronym ?? (projectTitle.length > 30 ? projectTitle.slice(0, 28) + "…" : projectTitle));
    setExpandLoading(true);
    const projNodeId = `project:${projectId}`;
    try {
      const data = await executeSparql(buildProjectParticipantsForGraphQuery(projectId));
      const bindings = data.results.bindings;
      const lbl = projectAcronym ?? (projectTitle.length > 30 ? projectTitle.slice(0, 28) + "…" : projectTitle);
      const newNodes = [{ id: projNodeId, label: lbl, type: "project", expanded: true, meta: { projectId, title: projectTitle, acronym: projectAcronym } }];
      const newEdges = [];
      const seen = /* @__PURE__ */ new Set();
      for (const b of bindings) {
        const orgName = getVal(b, "orgName") ?? "";
        const countryName = getVal(b, "countryName");
        if (!orgName) continue;
        const nodeId = `org:${orgName}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({ id: nodeId, label: orgName, type: "org", expanded: false, meta: { country: countryName } });
        newEdges.push({ source: projNodeId, target: nodeId });
      }
      setNodes(newNodes);
      setEdges(newEdges);
      setSelected({ id: projNodeId, label: lbl, type: "project", expanded: true, meta: { projectId, title: projectTitle, acronym: projectAcronym } });
      setSidebarProjects([]);
    } finally {
      setExpandLoading(false);
    }
  }
  async function expandOrg(node) {
    const orgName = node.label;
    setExpandLoading(true);
    const orgId = `org:${orgName}`;
    try {
      const data = await executeSparql(buildOrgProjectsForGraphQuery(orgName));
      const bindings = data.results.bindings;
      const newNodes = [];
      const newEdges = [];
      const seen = /* @__PURE__ */ new Set();
      for (const b of bindings) {
        const title = getVal(b, "projectTitle") ?? "";
        const acronym = getVal(b, "projectAcronym");
        const projectId = getVal(b, "projectId");
        const startDate = getVal(b, "startDate");
        if (!title) continue;
        const nodeId = `project:${projectId ?? title}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({ id: nodeId, label: acronym ?? (title.length > 30 ? title.slice(0, 28) + "…" : title), type: "project", expanded: true, meta: { projectId, title, startDate, acronym } });
        newEdges.push({ source: orgId, target: nodeId });
      }
      addNodes(newNodes, newEdges);
      markExpanded(orgId);
    } finally {
      setExpandLoading(false);
    }
  }
  const handleNodeClick = useCallback((node) => {
    setSelected(node);
    if (node.type === "org") {
      setSidebarProjects([]);
      setSidebarLoading(true);
      fetchOrgProjects(node.label).then(setSidebarProjects).catch(() => setSidebarProjects([])).finally(() => setSidebarLoading(false));
    }
  }, []);
  const liveSelected = selected ? nodes.find((n) => n.id === selected.id) ?? selected : null;
  const hasGraph = nodes.length > 0;
  if (!hasGraph) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden",
        style: { background: "linear-gradient(180deg, #fff5f7 0%, #ffffff 60%)" },
        children: [
          /* @__PURE__ */ jsx(HeroGraphAnimation, {}),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center text-center max-w-2xl", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 text-xs font-semibold",
                style: { background: "rgba(255,56,92,0.08)", border: "1px solid rgba(255,56,92,0.22)", color: "#ff385c" },
                children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsx("circle", { cx: "5", cy: "12", r: "2.5" }),
                    /* @__PURE__ */ jsx("circle", { cx: "19", cy: "6", r: "2.5" }),
                    /* @__PURE__ */ jsx("circle", { cx: "19", cy: "18", r: "2.5" }),
                    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "2.5" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M7.5 12h2M14.5 12h2M17 7.5l-3 3M17 16.5l-3-3" })
                  ] }),
                  "EURIO Knowledge Graph"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "h1",
              {
                className: "text-5xl sm:text-6xl font-bold leading-tight mb-5",
                style: { color: "#222222", letterSpacing: "-0.44px" },
                children: [
                  "Explore EU Research",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "animate-gradient-text", children: "Connections." })
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-lg leading-relaxed mb-10", style: { color: "#6a6a6a", maxWidth: "480px" }, children: "Discover how organisations, projects and countries are connected across the EU research landscape." }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "w-full max-w-xl rounded-2xl p-5 mb-10",
                style: {
                  background: "#ffffff",
                  boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 16px, rgba(0,0,0,0.1) 0px 8px 24px"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "flex gap-1 rounded-xl p-1 mb-4",
                      style: { background: "#f2f2f2" },
                      children: ["org", "project", "country"].map((m) => /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => {
                            setMode(m);
                            setSearchTerm("");
                            setSearchResults([]);
                            setProjectResults([]);
                            setShowDropdown(false);
                          },
                          className: "flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer border-0 transition-all duration-200",
                          style: mode === m ? { background: "#ffffff", color: "#222222", boxShadow: "rgba(0,0,0,0.08) 0px 2px 4px" } : { background: "transparent", color: "#6a6a6a" },
                          children: m === "org" ? "Organisation" : m === "project" ? "Project" : "Country"
                        },
                        m
                      ))
                    }
                  ),
                  mode === "org" || mode === "project" ? /* @__PURE__ */ jsxs("div", { className: "relative", ref: dropdownRef, children: [
                    /* @__PURE__ */ jsxs("svg", { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", fill: "none", stroke: "#6a6a6a", strokeWidth: 2, viewBox: "0 0 24 24", children: [
                      /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M21 21l-4.35-4.35" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value),
                        onFocus: () => (mode === "org" ? searchResults : projectResults).length > 0 && setShowDropdown(true),
                        placeholder: mode === "org" ? "Type to search organisation…" : "Type to search project title or acronym…",
                        className: "w-full pl-11 pr-10 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all",
                        style: { background: "#f7f7f7", border: "1px solid #ebebeb", color: "#222222", fontFamily: "inherit" },
                        onFocusCapture: (e) => {
                          e.target.style.borderColor = "#ff385c";
                          e.target.style.boxShadow = "0 0 0 2px rgba(255,56,92,0.12)";
                        },
                        onBlurCapture: (e) => {
                          e.target.style.borderColor = "#ebebeb";
                          e.target.style.boxShadow = "none";
                        }
                      }
                    ),
                    searchLoading && /* @__PURE__ */ jsx("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin", style: { borderColor: "#dddddd", borderTopColor: "#ff385c" } }),
                    showDropdown && mode === "org" && searchResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20", style: { background: "#ffffff", boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px" }, children: searchResults.map((r) => /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => loadOrg(r.name),
                        className: "w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-3 border-0",
                        style: { background: "transparent", color: "#222222", cursor: "pointer", fontFamily: "inherit", borderBottom: "1px solid #f7f7f7" },
                        onMouseEnter: (e) => e.currentTarget.style.background = "#f7f7f7",
                        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                        children: [
                          /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: r.name }),
                          /* @__PURE__ */ jsxs("span", { className: "text-xs shrink-0 font-medium", style: { color: "#ff385c" }, children: [
                            r.count,
                            " projects"
                          ] })
                        ]
                      },
                      r.name
                    )) }),
                    showDropdown && mode === "project" && projectResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20", style: { background: "#ffffff", boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px" }, children: projectResults.map((r) => /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => loadProject(r.projectId, r.title, r.acronym),
                        className: "w-full text-left px-4 py-3 text-sm flex items-start gap-3 border-0",
                        style: { background: "transparent", color: "#222222", cursor: "pointer", fontFamily: "inherit", borderBottom: "1px solid #f7f7f7" },
                        onMouseEnter: (e) => e.currentTarget.style.background = "#f7f7f7",
                        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                        children: /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                          r.acronym && /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold mb-0.5", style: { color: "#16a34a" }, children: r.acronym }),
                          /* @__PURE__ */ jsx("p", { className: "truncate font-medium", children: r.title.length > 60 ? r.title.slice(0, 58) + "…" : r.title })
                        ] })
                      },
                      r.projectId
                    )) })
                  ] }) : /* @__PURE__ */ jsxs(
                    "select",
                    {
                      defaultValue: "",
                      onChange: (e) => e.target.value && loadCountry(e.target.value),
                      className: "w-full py-3.5 px-4 rounded-xl text-sm font-medium focus:outline-none appearance-none",
                      style: { background: "#f7f7f7", border: "1px solid #ebebeb", color: "#222222", fontFamily: "inherit", cursor: "pointer" },
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select a country…" }),
                        countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
                      ]
                    }
                  ),
                  expandLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 text-sm", style: { color: "#6a6a6a" }, children: [
                    /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 rounded-full animate-spin shrink-0", style: { borderColor: "#dddddd", borderTopColor: "#ff385c" } }),
                    "Loading from EURIO…"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-6", children: [
              { color: "#2563eb", label: "Organisation" },
              { color: "#16a34a", label: "Project" },
              { color: "#d97706", label: "Country" }
            ].map(({ color, label }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", style: { color: "#6a6a6a" }, children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full", style: { background: color } }),
              label
            ] }, label)) })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col", style: { height: "calc(100vh - 4rem)" }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-3 px-4 py-2.5 shrink-0",
        style: { borderBottom: "1px solid #ebebeb", background: "#ffffff" },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex rounded-xl overflow-hidden text-xs",
              style: { border: "1px solid #ebebeb", background: "#f7f7f7", padding: "2px" },
              children: ["org", "project", "country"].map((m) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setMode(m);
                    setSearchTerm("");
                    setSearchResults([]);
                    setProjectResults([]);
                    setShowDropdown(false);
                  },
                  className: "px-3 py-1.5 font-semibold capitalize transition-all rounded-lg border-0 cursor-pointer",
                  style: {
                    background: mode === m ? "#ffffff" : "transparent",
                    color: mode === m ? "#222222" : "#6a6a6a",
                    boxShadow: mode === m ? "rgba(0,0,0,0.08) 0px 1px 3px" : "none"
                  },
                  children: m === "org" ? "Organisation" : m === "project" ? "Project" : "Country"
                },
                m
              ))
            }
          ),
          (mode === "org" || mode === "project") && /* @__PURE__ */ jsxs("div", { className: "relative", ref: dropdownRef, style: { width: 300 }, children: [
            /* @__PURE__ */ jsxs("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none", fill: "none", stroke: "#6a6a6a", strokeWidth: 2, viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
              /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M21 21l-4.35-4.35" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                onFocus: () => (mode === "org" ? searchResults : projectResults).length > 0 && setShowDropdown(true),
                placeholder: mode === "org" ? "Search organisation…" : "Search project title or acronym…",
                className: "w-full pl-9 pr-8 py-2 rounded-xl text-sm focus:outline-none",
                style: { background: "#f7f7f7", border: "1px solid #ebebeb", color: "#222222", fontFamily: "inherit" }
              }
            ),
            searchLoading && /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 rounded-full animate-spin", style: { borderColor: "#dddddd", borderTopColor: "#ff385c" } }),
            showDropdown && mode === "org" && searchResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20", style: { background: "#ffffff", boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px" }, children: searchResults.map((r) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => loadOrg(r.name),
                className: "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 border-0 cursor-pointer",
                style: { background: "transparent", color: "#222222", fontFamily: "inherit", borderBottom: "1px solid #f7f7f7" },
                onMouseEnter: (e) => e.currentTarget.style.background = "#f7f7f7",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: r.name }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs shrink-0", style: { color: "#ff385c" }, children: [
                    r.count,
                    " projects"
                  ] })
                ]
              },
              r.name
            )) }),
            showDropdown && mode === "project" && projectResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20", style: { background: "#ffffff", boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px" }, children: projectResults.map((r) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => loadProject(r.projectId, r.title, r.acronym),
                className: "w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 border-0 cursor-pointer",
                style: { background: "transparent", color: "#222222", fontFamily: "inherit", borderBottom: "1px solid #f7f7f7" },
                onMouseEnter: (e) => e.currentTarget.style.background = "#f7f7f7",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  r.acronym && /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold mb-0.5", style: { color: "#16a34a" }, children: r.acronym }),
                  /* @__PURE__ */ jsx("p", { className: "truncate font-medium", children: r.title.length > 50 ? r.title.slice(0, 48) + "…" : r.title })
                ] })
              },
              r.projectId
            )) })
          ] }),
          mode === "country" && /* @__PURE__ */ jsxs(
            "select",
            {
              defaultValue: "",
              onChange: (e) => e.target.value && loadCountry(e.target.value),
              className: "py-2 px-3 rounded-xl text-sm focus:outline-none appearance-none",
              style: { background: "#f7f7f7", border: "1px solid #ebebeb", color: "#222222", width: 220, fontFamily: "inherit", cursor: "pointer" },
              children: [
                /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select a country…" }),
                countries.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
              ]
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium", style: { color: "#6a6a6a" }, children: [
            nodes.length,
            " nodes · ",
            edges.length,
            " edges"
          ] }),
          expandLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs", style: { color: "#6a6a6a" }, children: [
            /* @__PURE__ */ jsx("div", { className: "w-3.5 h-3.5 border-2 rounded-full animate-spin", style: { borderColor: "#dddddd", borderTopColor: "#ff385c" } }),
            "Loading…"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setNodes([]);
                setEdges([]);
                setSelected(null);
                setSearchTerm("");
              },
              className: "ml-auto btn-secondary btn-sm",
              style: { height: "32px", fontSize: "12px" },
              children: "← Back"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 min-h-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 relative min-w-0", style: { background: "#fafafa" }, children: [
        /* @__PURE__ */ jsx(ForceGraph, { nodes, edges, selectedNodeId: liveSelected == null ? void 0 : liveSelected.id, onNodeClick: handleNodeClick }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "absolute bottom-4 left-4 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl text-xs",
            style: { background: "#ffffff", boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px" },
            children: [
              [
                { color: "#2563eb", label: "Organisation" },
                { color: "#16a34a", label: "Project" },
                { color: "#d97706", label: "Country" }
              ].map(({ color, label }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-medium", style: { color: "#484848" }, children: [
                /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { background: color } }),
                label
              ] }, label)),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px]", style: { color: "#aaaaaa" }, children: "Scroll to zoom · Drag to pan" })
            ]
          }
        )
      ] }),
      liveSelected && /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-72 shrink-0 flex flex-col",
          style: { borderLeft: "1px solid #ebebeb", background: "#ffffff" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "p-5 flex-1 overflow-y-auto", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-2 h-2 rounded-full",
                    style: { background: liveSelected.type === "org" ? "#2563eb" : liveSelected.type === "project" ? "#16a34a" : "#d97706" }
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest", style: { color: "#aaaaaa" }, children: liveSelected.type })
              ] }),
              liveSelected.type === "org" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold leading-snug mb-2", style: { color: "#222222" }, children: liveSelected.label }),
                ((_a = liveSelected.meta) == null ? void 0 : _a.country) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs mb-3", style: { color: "#6a6a6a" }, children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
                  ] }),
                  liveSelected.meta.country
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest mb-2", style: { color: "#aaaaaa" }, children: "CORDIS Projects" }),
                sidebarLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs py-2", style: { color: "#6a6a6a" }, children: [
                  /* @__PURE__ */ jsx("div", { className: "w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0", style: { borderColor: "#dddddd", borderTopColor: "#ff385c" } }),
                  "Loading projects…"
                ] }) : sidebarProjects.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: sidebarProjects.map((p, i) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "rounded-xl px-3 py-2.5",
                    style: { background: "#f7f7f7", border: "1px solid #ebebeb" },
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                          p.acronym && /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold mb-0.5", style: { color: "#16a34a" }, children: p.acronym }),
                          /* @__PURE__ */ jsx("p", { className: "text-xs leading-snug font-medium", style: { color: "#222222" }, children: p.title.length > 60 ? p.title.slice(0, 58) + "…" : p.title })
                        ] }),
                        p.startDate && /* @__PURE__ */ jsx("span", { className: "text-[10px] shrink-0 mt-0.5 font-medium", style: { color: "#aaaaaa" }, children: formatDate(p.startDate) })
                      ] }),
                      p.projectId && /* @__PURE__ */ jsx(
                        Link,
                        {
                          to: `/project/${p.projectId}`,
                          className: "text-[11px] mt-1.5 inline-flex items-center gap-0.5 font-semibold no-underline hover:underline",
                          style: { color: "#ff385c" },
                          children: "View in CORDIS →"
                        }
                      )
                    ]
                  },
                  i
                )) }) : /* @__PURE__ */ jsx("p", { className: "text-xs", style: { color: "#aaaaaa" }, children: "No projects found." }),
                !liveSelected.expanded && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => expandOrg(liveSelected),
                    disabled: expandLoading,
                    className: "mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all btn-primary",
                    style: { borderRadius: "12px" },
                    children: expandLoading ? "Loading…" : "+ Add to Graph"
                  }
                )
              ] }),
              liveSelected.type === "project" && /* @__PURE__ */ jsxs(Fragment, { children: [
                ((_b = liveSelected.meta) == null ? void 0 : _b.acronym) && /* @__PURE__ */ jsx("p", { className: "text-xs font-bold tracking-wider mb-1", style: { color: "#16a34a" }, children: liveSelected.meta.acronym }),
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold leading-snug mb-3", style: { color: "#222222" }, children: ((_c = liveSelected.meta) == null ? void 0 : _c.title) ?? liveSelected.label }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  ((_d = liveSelected.meta) == null ? void 0 : _d.startDate) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-medium", style: { color: "#6a6a6a" }, children: [
                    /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                      /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", strokeWidth: 2 }),
                      /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6", strokeWidth: 2 }),
                      /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6", strokeWidth: 2 }),
                      /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10", strokeWidth: 2 })
                    ] }),
                    "Started ",
                    formatDate(liveSelected.meta.startDate)
                  ] }),
                  (() => {
                    const cnt = connectedNodes(liveSelected.id, "org", nodes, edges).length;
                    return cnt > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-medium", style: { color: "#6a6a6a" }, children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" }) }),
                      cnt,
                      " organisation",
                      cnt !== 1 ? "s" : "",
                      " in graph"
                    ] }) : null;
                  })()
                ] }),
                ((_e = liveSelected.meta) == null ? void 0 : _e.projectId) && /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: `/project/${liveSelected.meta.projectId}`,
                    className: "mt-5 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 btn-primary no-underline",
                    style: { borderRadius: "12px" },
                    children: [
                      "View in CORDIS",
                      /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
                    ]
                  }
                )
              ] }),
              liveSelected.type === "country" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-3", style: { color: "#222222", letterSpacing: "-0.44px" }, children: liveSelected.label }),
                (() => {
                  const cnt = connectedNodes(liveSelected.id, "org", nodes, edges).length;
                  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", style: { color: "#6a6a6a" }, children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }),
                    cnt,
                    " organisation",
                    cnt !== 1 ? "s" : "",
                    " loaded"
                  ] });
                })(),
                /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs", style: { color: "#aaaaaa" }, children: "Click any organisation node to load its projects." })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelected(null),
                className: "px-4 py-3 text-xs text-left transition-colors border-0 cursor-pointer",
                style: { borderTop: "1px solid #ebebeb", color: "#aaaaaa", background: "#ffffff", fontFamily: "inherit" },
                onMouseEnter: (e) => e.currentTarget.style.background = "#f7f7f7",
                onMouseLeave: (e) => e.currentTarget.style.background = "#ffffff",
                children: "✕ Deselect"
              }
            )
          ]
        }
      )
    ] })
  ] });
}
function useOrgSummary(orgName) {
  return useQuery({
    queryKey: ["orgSummary", orgName],
    queryFn: async () => {
      var _a, _b;
      const data = await executeSparql(buildOrgSummaryQuery(orgName));
      const b = data.results.bindings[0];
      return {
        orgName,
        country: (_a = b == null ? void 0 : b.countryName) == null ? void 0 : _a.value,
        projectCount: parseInt(((_b = b == null ? void 0 : b.projectCount) == null ? void 0 : _b.value) ?? "0", 10)
      };
    },
    enabled: !!orgName,
    staleTime: 1e3 * 60 * 30
  });
}
function useOrgProjects(orgName) {
  return useQuery({
    queryKey: ["orgProjects", orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgProjectsQuery(orgName));
      return data.results.bindings.map((b) => {
        var _a, _b, _c, _d, _e, _f;
        return {
          title: ((_a = b.title) == null ? void 0 : _a.value) ?? "",
          acronym: (_b = b.acronym) == null ? void 0 : _b.value,
          identifier: (_c = b.identifier) == null ? void 0 : _c.value,
          startDate: (_e = (_d = b.startDate) == null ? void 0 : _d.value) == null ? void 0 : _e.slice(0, 10),
          role: (_f = b.roleLabel) == null ? void 0 : _f.value
        };
      });
    },
    enabled: !!orgName,
    staleTime: 1e3 * 60 * 30
  });
}
function useOrgCoApplicants(orgName) {
  return useQuery({
    queryKey: ["orgCoApplicants", orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgCoApplicantsQuery(orgName));
      return data.results.bindings.map((b) => {
        var _a, _b;
        return {
          orgName: ((_a = b.coOrgName) == null ? void 0 : _a.value) ?? "",
          sharedCount: parseInt(((_b = b.sharedCount) == null ? void 0 : _b.value) ?? "0", 10)
        };
      });
    },
    enabled: !!orgName,
    staleTime: 1e3 * 60 * 30
  });
}
function OrgPage() {
  const { encodedName } = useParams();
  const orgName = decodeURIComponent(encodedName ?? "");
  useEffect(() => {
    document.title = `${orgName} — CORDIS Explorer`;
  }, [orgName]);
  const { data: summary, isLoading: summaryLoading } = useOrgSummary(orgName);
  const { data: projects = [], isLoading: projectsLoading } = useOrgProjects(orgName);
  const { data: coApplicants = [], isLoading: coLoading } = useOrgCoApplicants(orgName);
  if (!orgName) {
    return /* @__PURE__ */ jsx("p", { className: "p-8 text-[var(--color-text-secondary)]", children: "No organisation specified." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-12 space-y-10", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)] mb-1", children: orgName }),
      summaryLoading ? /* @__PURE__ */ jsx(Spinner, {}) : summary && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-6 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-[var(--color-eu-blue-lighter)]", children: summary.projectCount }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mt-1", children: "EU Projects" })
        ] }),
        summary.country && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-[var(--color-text-primary)]", children: summary.country }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mt-1", children: "Country" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-4", children: "Recent Projects" }),
      projectsLoading ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsxs("div", { className: "divide-y divide-[var(--color-border)]", children: [
        projects.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "py-3 flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            p.identifier ? /* @__PURE__ */ jsxs(
              Link,
              {
                to: `/project/${encodeURIComponent(p.identifier)}`,
                className: "text-sm font-medium text-[var(--color-eu-blue-lighter)] hover:underline",
                children: [
                  p.acronym ? `${p.acronym} — ` : "",
                  p.title
                ]
              }
            ) : /* @__PURE__ */ jsxs("p", { className: "text-sm text-[var(--color-text-primary)]", children: [
              p.acronym ? `${p.acronym} — ` : "",
              p.title
            ] }),
            p.role && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mt-0.5", children: p.role })
          ] }),
          p.startDate && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-[var(--color-text-secondary)]", children: p.startDate.slice(0, 4) })
        ] }, i)),
        projects.length === 0 && /* @__PURE__ */ jsx("p", { className: "py-4 text-sm text-[var(--color-text-secondary)]", children: "No projects found." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-4", children: "Frequent Partners" }),
      coLoading ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        coApplicants.map((c, i) => /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/org/${encodeURIComponent(c.orgName)}`,
            className: "flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-eu-blue-lighter)] transition-colors",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-[var(--color-text-primary)] truncate", children: c.orgName }),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-xs text-[var(--color-text-secondary)] ml-2", children: [
                c.sharedCount,
                " shared"
              ] })
            ]
          },
          i
        )),
        coApplicants.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)]", children: "No co-applicants found." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link, { to: "/search", className: "text-sm text-[var(--color-eu-blue-lighter)] hover:underline", children: "← Back to search" }) })
  ] });
}
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const CATEGORY_COLORS = {
  "EEN Brokerage": "bg-blue-500",
  "EC Research & Innovation": "bg-purple-500",
  "MSCA": "bg-amber-500",
  "ERC": "bg-rose-500",
  "Horizon Europe": "bg-emerald-500"
};
function dotColor(category) {
  if (!category) return "bg-[var(--color-eu-blue)]";
  return CATEGORY_COLORS[category] ?? "bg-[var(--color-eu-blue)]";
}
function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}
function CalendarView({ events, isLoading }) {
  const today = /* @__PURE__ */ new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const eventsByDate = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const ev of events) {
      if (!ev.startDate) continue;
      const existing = map.get(ev.startDate) ?? [];
      existing.push(ev);
      map.set(ev.startDate, existing);
    }
    return map;
  }, [events]);
  const { days, firstWeekday } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let wd = new Date(year, month, 1).getDay();
    wd = wd === 0 ? 6 : wd - 1;
    return { days: daysInMonth, firstWeekday: wd };
  }, [year, month]);
  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
    setSelectedDate(null);
  }
  const todayStr = toDateStr(today);
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEvents = events.filter((e) => {
    var _a;
    return (_a = e.startDate) == null ? void 0 : _a.startsWith(monthStr);
  });
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: prevMonth,
          className: "p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
          "aria-label": "Previous month",
          children: "←"
        }
      ),
      /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-[var(--color-text-primary)]", children: [
        MONTHS[month],
        " ",
        year
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: nextMonth,
          className: "p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
          "aria-label": "Next month",
          children: "→"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 mb-1", children: WEEKDAYS.map((d) => /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] py-1", children: d }, d)) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-px bg-[var(--color-border)]", children: [
          Array.from({ length: firstWeekday }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "bg-[var(--color-bg-card)] min-h-[52px]" }, `empty-${i}`)),
          Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isPast = dateStr < todayStr;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setSelectedDate(isSelected ? null : dateStr),
                className: `
                    bg-[var(--color-bg-card)] min-h-[52px] p-1.5 text-left transition-colors relative
                    hover:bg-[var(--color-border)]/50
                    ${isSelected ? "ring-2 ring-inset ring-[var(--color-eu-blue)]" : ""}
                    ${isPast && !isToday ? "opacity-40" : ""}
                  `,
                children: [
                  /* @__PURE__ */ jsx("span", { className: `
                    text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full
                    ${isToday ? "bg-[var(--color-eu-blue)] text-white" : "text-[var(--color-text-primary)]"}
                  `, children: day }),
                  dayEvents.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-0.5 mt-0.5", children: [
                    dayEvents.slice(0, 3).map((ev, j) => /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(ev.category)}` }, j)),
                    dayEvents.length > 3 && /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-[var(--color-text-secondary)]", children: [
                      "+",
                      dayEvents.length - 3
                    ] })
                  ] })
                ]
              },
              day
            );
          })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[var(--color-text-secondary)] mt-3 text-center", children: "Dates are indicative — verify on official call pages before submitting." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 overflow-y-auto max-h-[420px]", children: selectedDate ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3", children: (/* @__PURE__ */ new Date(selectedDate + "T00:00:00")).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }),
        selectedEvents.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)]", children: "No events on this date." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: selectedEvents.map((ev) => /* @__PURE__ */ jsx(EventCard, { ev }, ev.id)) })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3", children: monthEvents.length > 0 ? `${MONTHS[month]} events` : "No events this month" }),
        monthEvents.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] leading-relaxed", children: "No events found for this month. Try browsing the sources above, or navigate to another month." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: monthEvents.map((ev) => /* @__PURE__ */ jsx(EventCard, { ev }, ev.id)) })
      ] }) })
    ] })
  ] });
}
function EventCard({ ev }) {
  return /* @__PURE__ */ jsx("div", { className: "text-xs space-y-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: `mt-1 w-2 h-2 rounded-full shrink-0 ${dotColor(ev.category)}` }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      ev.registrationUrl ? /* @__PURE__ */ jsx(
        "a",
        {
          href: ev.registrationUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "font-medium text-[var(--color-text-primary)] hover:text-[var(--color-eu-blue-lighter)] hover:underline leading-snug block",
          children: ev.title
        }
      ) : /* @__PURE__ */ jsx("p", { className: "font-medium text-[var(--color-text-primary)] leading-snug", children: ev.title }),
      (ev.city || ev.country) && /* @__PURE__ */ jsxs("p", { className: "text-[var(--color-text-secondary)]", children: [
        "📍 ",
        [ev.city, ev.country].filter(Boolean).join(", ")
      ] }),
      ev.endDate && ev.endDate !== ev.startDate && /* @__PURE__ */ jsxs("p", { className: "text-[var(--color-text-secondary)]", children: [
        "Until ",
        (/* @__PURE__ */ new Date(ev.endDate + "T00:00:00")).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      ] }),
      ev.category && /* @__PURE__ */ jsx("span", { className: "inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-border)] text-[var(--color-text-secondary)]", children: ev.category })
    ] })
  ] }) });
}
async function fetchEvents(filters) {
  const params = new URLSearchParams();
  if (filters.cluster) params.set("cluster", filters.cluster);
  if (filters.country) params.set("country", filters.country);
  params.set("page", String(filters.page));
  const resp = await fetch(`/api/events?${params}`);
  if (!resp.ok) throw new Error(`Events fetch failed: ${resp.status}`);
  return resp.json();
}
function useEvents(filters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => fetchEvents(filters),
    placeholderData: keepPreviousData,
    staleTime: 1e3 * 60 * 15
  });
}
const EVENT_SOURCES = [
  {
    name: "Enterprise Europe Network (EEN)",
    description: "Official EU brokerage events calendar — matchmaking sessions, partnership meetings, and consortium-building events across all Horizon Europe clusters.",
    url: "https://een.ec.europa.eu/events",
    type: "general"
  },
  {
    name: "European Commission Research Events",
    description: "Official EC research and innovation events including info days, stakeholder conferences, and programme launch events.",
    url: "https://research-and-innovation.ec.europa.eu/events_en",
    type: "general"
  },
  {
    name: "Horizon Europe Info Days (Funding & Tenders)",
    description: "Info days and webinars for open Horizon Europe calls — directly on the EU Funding & Tenders Portal.",
    url: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/events",
    type: "general"
  },
  {
    name: "Ideal-ist ICT / Digital (CL4)",
    description: "NCP network for ICT and digital technology — Cluster 4 brokerage events, partner search events, and proposal writing workshops.",
    url: "https://www.ideal-ist.eu/events",
    clusters: ["Digital, Industry & Space (CL4)"],
    type: "cluster"
  },
  {
    name: "GREENET (Climate & Energy) (CL5)",
    description: "Events for Cluster 5 (Climate, Energy, Mobility) — info days, brokerage, and NCP matchmaking in clean energy and transport.",
    url: "https://www.greenet.network/events",
    clusters: ["Climate, Energy & Mobility (CL5)"],
    type: "cluster"
  },
  {
    name: "Net4Society (Social Sciences) (CL2)",
    description: "NCP network for Cluster 2 (Culture, Creativity, Social Sciences) — training days, partnering events, and cross-cutting Social Sciences & Humanities activities.",
    url: "https://www.net4society.eu/events",
    clusters: ["Culture, Creativity & Society (CL2)"],
    type: "cluster"
  },
  {
    name: "BESTPRAC / EaP NCP Network (CL3)",
    description: "NCP coordination for Cluster 3 (Civil Security for Society) — networking events and brokerage.",
    url: "https://www.ncpeasecurity.eu/events/",
    clusters: ["Civil Security for Society (CL3)"],
    type: "cluster"
  },
  {
    name: "HealthNCPs (CL1)",
    description: "NCP network for Cluster 1 (Health) — consortium-building events, info days, and proposal support for health research calls.",
    url: "https://www.healthncps.eu/events/",
    clusters: ["Health (CL1)"],
    type: "cluster"
  },
  {
    name: "AgriFoodNCP Network (CL6)",
    description: "NCP network for Cluster 6 (Food, Bioeconomy, Agriculture) — partnering events and info days for food & nature research.",
    url: "https://www.ncp-agrifood.eu/events",
    clusters: ["Food, Bioeconomy & Agriculture (CL6)"],
    type: "cluster"
  },
  {
    name: "ERC Events",
    description: "European Research Council info days, webinars, and open science events for ERC grants (Starting, Consolidator, Advanced, Synergy).",
    url: "https://erc.europa.eu/news-events/events",
    type: "general"
  },
  {
    name: "MSCA Events",
    description: "Marie Skłodowska-Curie Actions info days, researcher training events, and MSCA matchmaking (Postdoctoral Fellowships, Doctoral Networks, etc.).",
    url: "https://marie-sklodowska-curie-actions.ec.europa.eu/events",
    type: "general"
  },
  {
    name: "KIC / EIT Events",
    description: "Events from EIT Knowledge and Innovation Communities (KIC Climate, KIC Food, KIC Health, KIC Manufacturing, etc.)",
    url: "https://eit.europa.eu/our-activities/events",
    type: "general"
  }
];
const TYPE_LABELS = {
  general: "General / Cross-Cluster",
  cluster: "Cluster-Specific NCP",
  national: "National NCP",
  matchmaking: "Matchmaking"
};
const TYPE_COLORS = {
  general: "bg-[var(--color-eu-blue)]/20 text-[var(--color-eu-blue-lighter)] border-[var(--color-eu-blue)]/30",
  cluster: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  national: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  matchmaking: "bg-purple-500/10 text-purple-300 border-purple-500/30"
};
const CLUSTER_MAP = {
  "1": ["Health (CL1)"],
  "2": ["Culture, Creativity & Society (CL2)"],
  "3": ["Civil Security for Society (CL3)"],
  "4": ["Digital, Industry & Space (CL4)"],
  "5": ["Climate, Energy & Mobility (CL5)"],
  "6": ["Food, Bioeconomy & Agriculture (CL6)"]
};
function EventsPage() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    cluster: selectedCluster ?? void 0,
    page: 1
  });
  useEffect(() => {
    document.title = "Brokerage Events — CORDIS Explorer";
  }, []);
  const filtered = selectedCluster ? EVENT_SOURCES.filter(
    (s) => {
      var _a;
      return !s.clusters || s.type === "general" || CLUSTER_MAP[selectedCluster] && ((_a = s.clusters) == null ? void 0 : _a.some((c) => CLUSTER_MAP[selectedCluster].includes(c)));
    }
  ) : EVENT_SOURCES;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)] mb-2", children: "Brokerage Events" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)]", children: "EU research networking and brokerage events from across the Horizon Europe ecosystem. Browse official sources for partnership opportunities, matchmaking sessions, and consortium-building events." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]", children: /* @__PURE__ */ jsx(
      ClusterBubbles,
      {
        selected: selectedCluster,
        onChange: setSelectedCluster,
        label: "Filter by Horizon Europe Cluster"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-4", children: "Upcoming Events" }),
      /* @__PURE__ */ jsx(
        CalendarView,
        {
          events: (eventsData == null ? void 0 : eventsData.events) ?? [],
          isLoading: eventsLoading
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[var(--color-text-primary)] mb-4", children: "Browse Event Sources" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filtered.map((source) => /* @__PURE__ */ jsx(
        "a",
        {
          href: source.url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 hover:border-[var(--color-eu-blue-lighter)] transition-colors group",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-[var(--color-text-primary)] text-sm group-hover:text-[var(--color-eu-blue-lighter)] transition-colors", children: source.name }),
                /* @__PURE__ */ jsx("span", { className: `shrink-0 text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[source.type]}`, children: TYPE_LABELS[source.type] })
              ] }),
              source.clusters && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mb-1", children: source.clusters.join(" · ") }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)] leading-relaxed", children: source.description })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs font-medium text-[var(--color-eu-blue-lighter)] whitespace-nowrap mt-1", children: "Browse events →" })
          ] })
        },
        source.url
      )) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-xs text-[var(--color-text-secondary)] text-center", children: [
      "Want to list your event?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://een.ec.europa.eu/events/add", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-[var(--color-text-primary)] transition-colors", children: "Submit to the EEN events calendar →" })
    ] })
  ] });
}
function useMscaProjects(filters) {
  const query = useQuery({
    queryKey: ["mscaProjects", filters],
    queryFn: async () => {
      const data = await executeSparql(
        buildMscaProjectSearchQuery(filters.keyword, filters.mscaType, filters.page, filters.pageSize)
      );
      return data.results.bindings.map((b) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
          uri: ((_a = b.project) == null ? void 0 : _a.value) ?? "",
          title: ((_b = b.title) == null ? void 0 : _b.value) ?? "",
          acronym: (_c = b.acronym) == null ? void 0 : _c.value,
          identifier: (_d = b.identifier) == null ? void 0 : _d.value,
          startDate: (_f = (_e = b.startDate) == null ? void 0 : _e.value) == null ? void 0 : _f.slice(0, 10),
          countries: ((_g = b.countryName) == null ? void 0 : _g.value) ? [b.countryName.value] : [],
          topicLabel: (_h = b.mscaLabel) == null ? void 0 : _h.value
        };
      });
    },
    placeholderData: keepPreviousData
  });
  return { ...query, isLoading: query.isLoading || query.isFetching };
}
function useMscaSupervisors(researchArea) {
  const query = useQuery({
    queryKey: ["mscaSupervisors", researchArea],
    queryFn: async () => {
      const data = await executeSparql(buildMscaSupervisorSearchQuery(researchArea));
      return data.results.bindings.map((b) => {
        var _a, _b, _c, _d;
        return {
          orgName: ((_a = b.orgName) == null ? void 0 : _a.value) ?? "",
          country: (_b = b.countryName) == null ? void 0 : _b.value,
          mscaProjectCount: parseInt(((_c = b.mscaProjectCount) == null ? void 0 : _c.value) ?? "0", 10),
          projectTitles: (((_d = b.projectTitles) == null ? void 0 : _d.value) ?? "").split("||").filter(Boolean).slice(0, 3)
        };
      });
    },
    enabled: researchArea.length >= 3,
    staleTime: 1e3 * 60 * 30
  });
  return { ...query, isLoading: query.isLoading || query.isFetching };
}
const PAGE_SIZE = 20;
const MSCA_TYPES = [
  { value: "all", label: "All MSCA" },
  { value: "PF", label: "Postdoctoral Fellowships" },
  { value: "DN", label: "Doctoral Networks" },
  { value: "SE", label: "Staff Exchanges" },
  { value: "IF", label: "Individual Fellowships (H2020)" },
  { value: "COFUND", label: "COFUND" }
];
function MscaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") ?? "projects"
  );
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [inputValue, setInputValue] = useState(keyword);
  const [mscaType, setMscaType] = useState(
    searchParams.get("type") ?? "all"
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") ?? "1", 10));
  const [supervisorArea, setSupervisorArea] = useState(searchParams.get("area") ?? "");
  const [supervisorInput, setSupervisorInput] = useState(supervisorArea);
  useEffect(() => {
    document.title = "MSCA Search — CORDIS Explorer";
  }, []);
  const { data: projects = [], isLoading: projectsLoading } = useMscaProjects({
    keyword,
    mscaType,
    page,
    pageSize: PAGE_SIZE
  });
  const { data: supervisors = [], isLoading: supervisorsLoading } = useMscaSupervisors(supervisorArea);
  const saveHistory = useSaveHistory();
  const savedProjectKeyRef = useRef("");
  const savedSupervisorKeyRef = useRef("");
  useEffect(() => {
    if (!keyword || projects.length === 0) return;
    const key = `${keyword}:${mscaType}:${page}`;
    if (savedProjectKeyRef.current === key) return;
    savedProjectKeyRef.current = key;
    saveHistory.mutate({
      query_type: "msca_projects",
      query_params: { keyword, mscaType },
      result_count: projects.length,
      results_snapshot: projects.slice(0, 8).map((p) => ({ title: p.title, acronym: p.acronym, identifier: p.identifier }))
    });
  }, [projects, keyword, mscaType]);
  useEffect(() => {
    if (!supervisorArea || supervisors.length === 0) return;
    if (savedSupervisorKeyRef.current === supervisorArea) return;
    savedSupervisorKeyRef.current = supervisorArea;
    saveHistory.mutate({
      query_type: "msca_supervisors",
      query_params: { researchArea: supervisorArea },
      result_count: supervisors.length,
      results_snapshot: supervisors.slice(0, 8).map((s) => ({ orgName: s.orgName, country: s.country, mscaProjectCount: s.mscaProjectCount }))
    });
  }, [supervisors, supervisorArea]);
  function search() {
    setKeyword(inputValue);
    setPage(1);
    const params = { tab: activeTab };
    if (inputValue) params.q = inputValue;
    if (mscaType !== "all") params.type = mscaType;
    setSearchParams(params, { replace: true });
  }
  function searchSupervisors() {
    setSupervisorArea(supervisorInput);
    setSearchParams({ tab: "supervisors", area: supervisorInput }, { replace: true });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)] mb-2", children: "MSCA Research Explorer" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)]", children: "Search Marie Skłodowska-Curie Actions projects, and discover host organisations and supervisors by research area." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-6 p-1 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] w-fit", children: ["projects", "supervisors"].map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setActiveTab(tab);
          setSearchParams({ tab }, { replace: true });
        },
        className: `px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-[var(--color-eu-blue)] text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`,
        children: tab === "projects" ? "Projects" : "Supervisors & Hosts"
      },
      tab
    )) }),
    activeTab === "projects" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-4", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search MSCA projects (e.g. quantum computing, RNA biology…)",
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") search();
            },
            className: "flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: search,
            className: "px-5 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity",
            children: "Search"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-6", children: MSCA_TYPES.map((t) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMscaType(t.value),
          className: `px-3 py-1 rounded-full text-xs font-medium border transition-all ${mscaType === t.value ? "bg-[var(--color-eu-blue)] text-white border-transparent" : "text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-eu-blue-lighter)]"}`,
          children: t.label
        },
        t.value
      )) }),
      projectsLoading && /* @__PURE__ */ jsx(Spinner, {}),
      !projectsLoading && projects.length === 0 && /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No MSCA projects found",
          description: "Try different keywords or select a different MSCA type."
        }
      ),
      !projectsLoading && projects.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-[var(--color-border)] mb-8", children: projects.map((p, i) => /* @__PURE__ */ jsx("div", { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            p.identifier ? /* @__PURE__ */ jsxs(
              Link,
              {
                to: `/project/${encodeURIComponent(p.identifier)}`,
                className: "text-sm font-medium text-[var(--color-eu-blue-lighter)] hover:underline",
                children: [
                  p.acronym ? `${p.acronym} — ` : "",
                  p.title
                ]
              }
            ) : /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-[var(--color-text-primary)]", children: [
              p.acronym ? `${p.acronym} — ` : "",
              p.title
            ] }),
            p.countries.length > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mt-0.5", children: p.countries.join(", ") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-right", children: [
            p.startDate && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)]", children: p.startDate.slice(0, 4) }),
            p.topicLabel && /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--color-text-secondary)] block mt-0.5", children: p.topicLabel })
          ] })
        ] }) }, i)) }),
        /* @__PURE__ */ jsx(
          Pagination,
          {
            page,
            pageSize: PAGE_SIZE,
            resultCount: projects.length,
            onPageChange: (p) => {
              setPage(p);
              window.scrollTo(0, 0);
            }
          }
        )
      ] })
    ] }),
    activeTab === "supervisors" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Research area (e.g. machine learning, proteomics, urban planning…)",
            value: supervisorInput,
            onChange: (e) => setSupervisorInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") searchSupervisors();
            },
            className: "flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: searchSupervisors,
            className: "px-5 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity",
            children: "Find Hosts"
          }
        )
      ] }),
      supervisorsLoading && /* @__PURE__ */ jsx(Spinner, {}),
      !supervisorsLoading && supervisors.length === 0 && supervisorArea.length >= 3 && /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No host organisations found",
          description: "Try a broader research area term."
        }
      ),
      !supervisorsLoading && supervisors.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: supervisors.map((org, i) => /* @__PURE__ */ jsxs(
        Link,
        {
          to: `/org/${encodeURIComponent(org.orgName)}`,
          className: "block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-eu-blue-lighter)] transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[var(--color-text-primary)]", children: org.orgName }),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-xs text-[var(--color-eu-blue-lighter)] font-medium", children: [
                org.mscaProjectCount,
                " MSCA"
              ] })
            ] }),
            org.country && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--color-text-secondary)] mb-2", children: org.country }),
            /* @__PURE__ */ jsx("ul", { className: "text-xs text-[var(--color-text-secondary)] space-y-0.5 list-disc list-inside", children: org.projectTitles.slice(0, 2).map((t, j) => /* @__PURE__ */ jsx("li", { children: t }, j)) })
          ]
        },
        i
      )) })
    ] })
  ] });
}
const TYPE_META = {
  project_search: {
    label: "Project Search",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: "🔍",
    toUrl: (p) => `/search?q=${encodeURIComponent(String(p.keyword ?? ""))}${p.cluster ? `&cluster=${p.cluster}` : ""}${p.actionType ? `&actionType=${p.actionType}` : ""}${p.country ? `&country=${p.country}` : ""}`
  },
  partner_search: {
    label: "Partner Search",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: "🤝",
    toUrl: (p) => `/partner-search?callId=${encodeURIComponent(String(p.callId ?? ""))}${p.country ? `&country=${p.country}` : ""}`
  },
  msca_projects: {
    label: "MSCA Projects",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: "🎓",
    toUrl: (p) => `/msca?tab=projects&q=${encodeURIComponent(String(p.keyword ?? ""))}${p.mscaType && p.mscaType !== "all" ? `&type=${p.mscaType}` : ""}`
  },
  msca_supervisors: {
    label: "MSCA Supervisors",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: "🏛",
    toUrl: (p) => `/msca?tab=supervisors&area=${encodeURIComponent(String(p.researchArea ?? ""))}`
  },
  grant_match: {
    label: "Grant Match",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: "✦",
    toUrl: () => "/grant-match"
  },
  ai_rerank: {
    label: "AI Re-rank",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    icon: "🤖",
    toUrl: (p) => `/search?q=${encodeURIComponent(String(p.keyword ?? ""))}`
  }
};
const TABS = [
  { value: "all", label: "All" },
  { value: "project_search", label: "Projects" },
  { value: "partner_search", label: "Partners" },
  { value: "msca_projects", label: "MSCA" },
  { value: "msca_supervisors", label: "Supervisors" },
  { value: "grant_match", label: "Grant Match" }
];
function queryLabel(entry) {
  const p = entry.query_params;
  switch (entry.query_type) {
    case "project_search":
      return String(p.keyword ?? "All projects");
    case "partner_search":
      return String(p.callId ?? "Partner search");
    case "msca_projects":
      return `${p.keyword ?? "All"} · ${p.mscaType && p.mscaType !== "all" ? p.mscaType : "All types"}`;
    case "msca_supervisors":
      return String(p.researchArea ?? "Supervisor search");
    case "grant_match":
      return "Grant Match session";
    case "ai_rerank":
      return `AI re-rank: ${p.keyword ?? ""}`;
    default:
      return "Search";
  }
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function HistoryPage() {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const { data, isLoading } = useHistory(activeTab === "all" ? void 0 : activeTab);
  const deleteHistory = useDeleteHistory();
  useEffect(() => {
    document.title = "Search History — CORDIS Explorer";
  }, []);
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-4 py-24 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl mb-4", children: "🔐" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[var(--color-text-primary)] mb-2", children: "Sign in to view your history" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)] mb-6", children: "Your search history is saved automatically when you're signed in." }),
      /* @__PURE__ */ jsx("button", { onClick: openAuthModal, className: "btn-primary btn-sm btn-pill px-6", children: "Sign in" })
    ] });
  }
  const items = (data == null ? void 0 : data.items) ?? [];
  const total = (data == null ? void 0 : data.total) ?? 0;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)]", children: "Search History" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-[var(--color-text-secondary)] mt-0.5", children: [
          total,
          " saved ",
          total === 1 ? "search" : "searches"
        ] })
      ] }),
      items.length > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            if (confirm("Clear all search history?")) deleteHistory.mutate("all");
          },
          className: "text-xs text-[var(--color-text-secondary)] hover:text-rose-400 transition-colors",
          children: "Clear all"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-6 p-1 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] w-fit flex-wrap", children: TABS.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.value),
        className: `px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === tab.value ? "bg-[var(--color-eu-blue)] text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`,
        children: tab.label
      },
      tab.value
    )) }),
    isLoading && /* @__PURE__ */ jsx(Spinner, {}),
    !isLoading && items.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl mb-3", children: "📭" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-text-secondary)]", children: "No searches yet. Start exploring to build your history." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-block mt-4 text-sm text-[var(--color-eu-blue-lighter)] hover:underline", children: "Go to home →" })
    ] }),
    !isLoading && items.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((entry) => {
      const meta = TYPE_META[entry.query_type];
      const snapshot = entry.results_snapshot ?? [];
      return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 group", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl mt-0.5 shrink-0", children: meta.icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`, children: meta.label }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--color-text-secondary)]", children: timeAgo(entry.created_at) }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--color-text-secondary)]", children: [
              "· ",
              entry.result_count,
              " results"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[var(--color-text-primary)] mb-2", children: queryLabel(entry) }),
          snapshot.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1 mb-3", children: [
            snapshot.slice(0, 5).map((r, i) => /* @__PURE__ */ jsx("span", { className: "text-[11px] px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-secondary)]", children: String(r.acronym || r.orgName || r.title || "").slice(0, 40) }, i)),
            snapshot.length > 5 && /* @__PURE__ */ jsxs("span", { className: "text-[11px] px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-secondary)]", children: [
              "+",
              snapshot.length - 5,
              " more"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx(
            Link,
            {
              to: meta.toUrl(entry.query_params),
              className: "text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline",
              children: "Re-run search →"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => deleteHistory.mutate(entry.id),
            className: "shrink-0 text-[var(--color-text-secondary)] hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none",
            "aria-label": "Delete entry",
            children: "×"
          }
        )
      ] }) }, entry.id);
    }) })
  ] });
}
function AuthModal() {
  const { closeAuthModal } = useAuth();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    if (tab === "signin") {
      const { error: error2 } = await supabase.auth.signInWithPassword({ email, password });
      if (error2) setError(error2.message);
      else closeAuthModal();
    } else {
      const { error: error2 } = await supabase.auth.signUp({ email, password });
      if (error2) {
        setError(error2.message);
      } else {
        setMessage("Account created — you are now signed in.");
        closeAuthModal();
      }
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0",
        style: { background: "rgba(34,34,34,0.55)", backdropFilter: "blur(4px)" },
        onClick: closeAuthModal
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative w-full max-w-sm rounded-2xl p-7",
        style: {
          background: "#ffffff",
          boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px, rgba(0,0,0,0.15) 0px 16px 48px"
        },
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: closeAuthModal,
              className: "btn-circle absolute top-4 right-4",
              style: { width: "32px", height: "32px" },
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4",
                style: { background: "#003399" },
                children: "EU"
              }
            ),
            /* @__PURE__ */ jsx(
              "h2",
              {
                className: "text-xl font-bold mb-1",
                style: { color: "#222222", letterSpacing: "-0.18px" },
                children: tab === "signin" ? "Welcome back" : "Create your account"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "#6a6a6a" }, children: "AI-powered grant matching requires an account" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-xl p-1 mb-5", style: { background: "#f2f2f2" }, children: ["signin", "signup"].map((t) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setTab(t);
                setError("");
                setMessage("");
              },
              className: "flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer border-0 transition-all duration-200",
              style: tab === t ? { background: "#ffffff", color: "#222222", boxShadow: "rgba(0,0,0,0.08) 0px 2px 4px" } : { background: "transparent", color: "#6a6a6a" },
              children: t === "signin" ? "Sign In" : "Sign Up"
            },
            t
          )) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  required: true,
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  placeholder: "you@example.com",
                  className: "gm-input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  required: true,
                  minLength: 6,
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: "••••••••",
                  className: "gm-input"
                }
              )
            ] }),
            error && /* @__PURE__ */ jsx("p", { className: "text-xs rounded-lg px-3 py-2", style: { color: "#c13515", background: "rgba(193,53,21,0.06)", border: "1px solid rgba(193,53,21,0.18)" }, children: error }),
            message && /* @__PURE__ */ jsx("p", { className: "text-xs rounded-lg px-3 py-2", style: { color: "#167445", background: "rgba(22,116,69,0.06)", border: "1px solid rgba(22,116,69,0.18)" }, children: message }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "btn-primary w-full mt-1",
                style: { borderRadius: "8px" },
                children: loading ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function App() {
  const { showAuthModal } = useAuth();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsxs(Routes, { children: [
      /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(HomePage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/search", element: /* @__PURE__ */ jsx(SearchPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/project/:id", element: /* @__PURE__ */ jsx(ProjectPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/grant-match", element: /* @__PURE__ */ jsx(GrantMatchPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/profile-match", element: /* @__PURE__ */ jsx(ProfileMatchPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/grant-search", element: /* @__PURE__ */ jsx(GrantSearchPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/admin", element: /* @__PURE__ */ jsx(AdminPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/map", element: /* @__PURE__ */ jsx(MapPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/partner-match", element: /* @__PURE__ */ jsx(PartnerMatchPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/partner-search", element: /* @__PURE__ */ jsx(PartnerSearchPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/pricing", element: /* @__PURE__ */ jsx(CreditsPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/credits", element: /* @__PURE__ */ jsx(CreditsPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/graph", element: /* @__PURE__ */ jsx(KnowledgeGraphPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/org/:encodedName", element: /* @__PURE__ */ jsx(OrgPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/events", element: /* @__PURE__ */ jsx(EventsPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/msca", element: /* @__PURE__ */ jsx(MscaPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/history", element: /* @__PURE__ */ jsx(HistoryPage, {}) })
    ] }) }),
    /* @__PURE__ */ jsx(Footer, {}),
    showAuthModal && /* @__PURE__ */ jsx(AuthModal, {})
  ] });
}
function ServerAuthProvider({ children }) {
  const value = {
    user: null,
    session: null,
    loading: false,
    showAuthModal: false,
    openAuthModal: () => {
    },
    closeAuthModal: () => {
    },
    signOut: async () => {
    }
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function render(url) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  const html = renderToString(
    /* @__PURE__ */ jsx(React__default.StrictMode, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(ServerAuthProvider, { children: /* @__PURE__ */ jsx(App, {}) }) }) }) })
  );
  return html;
}
export {
  render
};
