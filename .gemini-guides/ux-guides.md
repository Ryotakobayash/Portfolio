
--- Guide for scroll-entry-exit-effects ---
# Add entry and exit effects to elements as they enter or exit the scrollport

Entry and exit effects are animations that are triggered when an element enters or leaves the viewport. This can be used to create engaging and dynamic user experiences. For example, you can use an entry effect to fade in an element as it scrolls into view, or an exit effect to scale it down as it scrolls out of view.

## How to implement

To add entry and exit effects to an element, you need to combine a few CSS properties. Here’s a step-by-step guide:

1.  **Create separate `@keyframes` for the entry and exit animations.** The entry animation will be applied as the element enters the viewport, and the exit animation will be applied as it leaves.

    ```css
    @keyframes slide-in {
      from { transform: translateX(-100%); }
    }
    @keyframes slide-out {
      to { transform: translateX(100%); }
    }
    ```

2.  **Attach the entry and exit keyframes to the element.** You can do this by defining multiple animations in the `animation` property.

    -   Give the entry animation an `animation-fill-mode` of `backwards` so that it applies its initial state before the animation starts.
    -   Give the exit animation an `animation-fill-mode` of `forwards` so that it maintains its final state after the animation is complete.

    ```css
    .animated-element {
      animation:
        slide-in 1s linear backwards,
        slide-out 1s linear forwards;
    }
    ```

3.  **Create a View Timeline and link it to the animations.** A View Timeline is a type of timeline that is linked to the visibility of an element in the viewport. You can create one using the `view()` function and then apply it to your animations using the `animation-timeline` property.

    ```css
    .animated-element {
      animation-timeline: view();
    }
    ```

    By default, `view()` tracks the element on the `block` axis. If you need to track it on the `inline` axis, you can use `view(inline)`.

4.  **Limit the animations to the `entry` and `exit` ranges.** The `animation-range` property allows you to specify which part of the timeline an animation should run on.

    -   The `entry` range covers the time from when the element first enters the viewport until it is fully visible.
    -   The `exit` range covers the time from when the element starts to leave the viewport until it is completely hidden.

    ```css
    .animated-element {
      animation-range: entry, exit;
    }
    ```

## Example code

This code animates the direct children of the scroller on scroll using an **anonymous view-timeline**:

```css
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: view()) and (animation-range: entry)) {
    @keyframes grow {
      from {
        scale: 0.5;
      }
    }
    @keyframes shrink {
      to {
        scale: 0.5;
      }
    }

    .scroller > * {
      animation:
        grow auto linear backwards,
        shrink auto linear forwards;
      animation-timeline: view(inline);
      animation-range: entry, exit;
    }
  }
}
```

As the elements enter the scrollport the `grow` animation is played, and as they leave the scrollport the `shrink` animation is played.

The following code has the same visual outcome, but animates the direct children of the scroller on scroll using an **named view-timeline**:

```css
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: view()) and (animation-range: entry)) {
    @keyframes grow {
      from {
        scale: 0.5;
      }
    }
    @keyframes shrink {
      to {
        scale: 0.5;
      }
    }

    .scroller > * {
      view-timeline: --tl inline;
      animation:
        grow auto linear backwards,
        shrink auto linear forwards;
      animation-timeline: --tl;
      animation-range: entry, exit;
    }
  }
}
```

## Best Practices

When using scroll-driven animations, it's important to follow a few best practices to ensure a smooth and accessible experience:

- **DO** include feature detection: Not all browsers support scroll-driven animations. Use `@supports ((animation-timeline: view()) and (animation-range: entry))` to check for support and provide a fallback for browsers that don't support it.
  - The `(animation-range: entry)` check **MUST** be included here, to filter out browsers with only partial support.
  - **DO NOT** use the `scroll-timeline-polyfill` package for the fallback strategy as it is not feature complete and has a lot of known issues.
  - If the animation is only considered to be decorative, opt for Progressive Enhancement and **DO NOT** provide a fallback.
- **DO** respect user preferences: Some users prefer to have less motion on the web. Use the `prefers-reduced-motion` media query to disable or reduce your animations for these users.
- **DO** try to animate only performant CSS properties: For the smoothest animations, stick to animating properties that can be handled by the browser's compositor thread, such as `transform` and `opacity`. Animating other properties like `width` or `height` can lead to performance issues.
- **DO** use the correct declaration order: When using the `animation` shorthand property, declare `animation-timeline` *after* it to prevent the shorthand from resetting the timeline.

When using the `view()` function to create a scroll-driven animation:

- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view(block)` or `view(inline)`.
- When the animation is not applied to the tracked subject itself, use a named view timeline.

When using the `view-timeline` property to create a scroll-driven animation:

- **DO** use a CSS `<dashed-ident>` for the name.
- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view-timeline-axis`.
- **DO** make sure the scope of the lookup works: When the element that is declaring the `view-timeline` is not a flat tree ancestor of the animated element, hoist up the visibility of the `view-timeline`’s name by using `timeline-scope` on a shared ancestor.

Prefer a named `view-timeline` when multiple elements or children of the tracked subject need to animate.

## Browser support and fallback strategies

Scroll-driven animations has limited availability.
Supported by: Chrome 115 (Jul 2023), Edge 115 (Jul 2023), and Safari 26 (Sep 2025).
Unsupported in: Firefox.. Therefore, a fallback strategy is typically required.

For browsers that do not support scroll-driven animations, you can use a fallback to recreate the visual effects. The fallbacks are typically built with either a scroll listener (for ScrollTimeline effects) or the IntersectionObserver API (for ViewTimeline effects).

In browsers with built-in support for scroll-driven animations, ALWAYS use the native CSS implementation as those are more performant.

Note that not every effect can be recreated using the fallbacks approach.

For this use-case specifically, the following script applies the fallback for browsers that do not support scroll-driven animations. It uses an `IntersectionObserver` to track the visibility of the `.wrapper` element and updates the `transform` property of the layers based on the scroll position.

```html
<script>
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // This matches the effect as defined in the CSS example above.
          // Customize this further if needed.
          entry.target.style.scale = 0.5 + entry.intersectionRatio * 0.5;
        }
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    document.querySelectorAll('.scroller > *').forEach((el) => {
      observer.observe(el);
    });
  }
</script>
```


--- Guide for defer-rendering-heavy-content ---
# Defer rendering heavy content

Web pages with extensive content—such as infinite scrolls, complex dashboards, or dense articles can suffer from slow initial rendering and sluggish interactions. Modern web technologies allow you to defer the rendering workload for content that is not immediately visible, significantly boosting performance without breaking accessibility or user expectations.

To optimize rendering, you can utilize the CSS `content-visibility` property and the HTML `hidden="until-found"` attribute. While both aid performance, they serve distinct use cases.

## When to use which

| Scenario / Example | Feature Applied | Performance Benefit |
| :--- | :--- | :--- |
| **1. Below the fold** (Delay initial load) | **`content-visibility: auto`** | Browser automatically offloads layout/paint workload until the container scrolls close to view, keeping standard page load speed frictionless. |
| **2. Toggle State** (Fast view switching) | **`content-visibility: hidden`** | Skips layout calculations for hidden divs but preserves style containment state, allowing for instantaneous toggling without structural shifts (superior to `display: none`). |
| **3. Searchable & Deferred** (Collapsible disclosures) | **`hidden="until-found"`** | For detailed instructions on combining rendering performance with find-in-page search accessibility, see `search-hidden-content` (via `npx -y modern-web-guidance@latest retrieve "search-hidden-content"`). |

## How to implement `content-visibility: auto`

### Choosing off-screen content

**MANDATORY**: You MUST carefully identify which elements receive `content-visibility: auto`.
- **DO** target large, self-contained layout blocks that are strictly **below the initial fold** (e.g., card items in an infinite feed, trailing comments, or bottom-heavy layout sections).
- **DO NOT** apply this property to elements within the initial, above-the-fold viewport. Doing so forces the browser to evaluate visibility boundaries before rendering, which paradoxically delays critical page load performance.
- **DO** target elements with deep or complex internal DOM structures to maximize rendering cost savings.

### Implementation steps

1. **MANDATORY**: Identify heavy sections that are confirmed to be off-screen on initial load.
2. **MANDATORY**: Apply `content-visibility: auto` to each of these off-screen elements.
3. **MANDATORY**: Provide an estimated layout structure size using `contain-intrinsic-size` on each element.

### How to use `contain-intrinsic-size`

**MANDATORY**: You MUST pair `content-visibility: auto` with `contain-intrinsic-size`. Failure to do so forces the browser to collapse the element to a 0px height when off-screen, causing severe layout shifting and scrollbar jumping as the user scrolls.

The `contain-intrinsic-size` CSS shorthand property acts as a placeholder dimension. Using the `auto` keyword enables the browser to "remember" the exact size once the element is finally rendered, using that calculated size over the placeholder if the element goes off-screen again.

### Example code

```css
/* DO ONLY apply this class to items OUTSIDE the initial layout viewport */
.heavy-section-deferred {
  /* MANDATORY: Skips rendering calculations when off-screen */
  content-visibility: auto;
  
  /* Mandatory: Provide an estimated size to prevent layouts shifts.
    - 'auto' is optional and enables the browser to remember the actual size
      once rendered. It must be paired with a <length> value to be used for
      the first render.
    - 'none' tells the browser not to apply any intrinsic width to this element.
      It can be used for either the height or the width value.
    - '150px' is the estimated height of this element. This can be any valid
      CSS <length> value.
   */
  contain-intrinsic-size: auto none auto 150px; 
}
```

## How to implement `content-visibility: hidden`

1. **Identify heavy sections:** Locate layout blocks that are initially hidden (e.g., extra rows in a large data table).
2. **Apply CSS:** Add `content-visibility: hidden` to the element.
3. **Reveal the element:** When the element should be revealed, change the `content-visibility` property to `visible` or `auto`.

### Example code

```css
.cached-view {
  /* Hides content but caches rendering state */
  content-visibility: hidden;
}

.cached-view.is-active {
  content-visibility: visible;
}
```

Because `content-visibility: hidden` excludes the element and its children from the accessibility tree and find-in-page search, **DO NOT** use it if the content must remain discoverable while hidden. If you need hidden content to remain searchable via native Find-in-page, use `hidden="until-found"` as described in `search-hidden-content` (via `npx -y modern-web-guidance@latest retrieve "search-hidden-content"`).

## Best Practices

- **DO** use `contain-intrinsic-size` with `content-visibility: auto`. Failure to do so forces height recalculations on scroll, causing viewport layout jumping or visual glitches.
- **DO NOT** apply `content-visibility: auto` to elements inside the initial fold viewport, as this delays critical page rendering.
- **MANDATORY Accessibility Verification**: When applying `content-visibility: auto`, you MUST verify sequential keyboard reachability. In certain assistive technology configurations, off-screen nodes utilizing `content-visibility: auto` may be excluded from the accessibility tree or sequential navigation routes until focus is forcibly moved inside them. Test linear navigation across off-screen boundaries using keyboard alone.

## Fallback strategies

### `content-visibility` fallback

Baseline status for content-visibility: Newly available. It's been Baseline since 2025-09-15.
Supported by: Chrome 108 (Nov 2022), Edge 108 (Dec 2022), Firefox 130 (Sep 2024), and Safari 26 (Sep 2025).

When `content-visibility` is not supported it will be ignored by the browser. In most cases `content-visibility: auto` will not need a fallback, though without it performance gains will be lost. An unsupported browser will leave `content-visibility: hidden` elements completely visible. Use feature detection to implement a fallback.

```css
/* Default for everyone */
.inactive {
  display: none;
}

/* Modern Browsers only */
@supports (content-visibility: hidden) {
 .inactive {
    display: block; /* Turn the layout box back on */
    content-visibility: hidden;
  }
}
```


--- Guide for optimize-image-priority ---
# Optimize image priority

Browsers use heuristics to assign loading priorities to images, but these defaults may not always align with your page's Largest Contentful Paint (LCP). Using `fetchpriority` on an `<img>` element allows you to explicitly signal an image's importance to the browser, ensuring critical images load faster while non-essential ones don't compete for bandwidth.

## How to implement

1. **Identify the LCP image**: Determine which image is the most likely candidate for the Largest Contentful Paint (usually the hero image at the top of the page).
2. **Elevate LCP priority**: Add `fetchpriority="high"` to the `<img>` element for the LCP candidate.
3. **Deprioritize non-critical images**: For images that are part of a secondary UI or are only revealed after user interaction (like mega menus, modals, or off-screen carousel slides), add `fetchpriority="low"`.
4. **Optimize lazy loading**: Never use `loading="lazy"` on the LCP image. For standard below-the-fold images, `loading="lazy"` is sufficient to defer the request until the user scrolls near them. Avoid adding `fetchpriority="low"` to these images, as you want them to load at normal priority once the user scrolls to them. Reserve `fetchpriority="low"` for images that are technically "above the fold" but not initially visible (e.g., hidden carousel slides or mega menus). For these hidden images, it is acceptable to use `loading="lazy"` as well; the browser will handle the request timing while respecting the low priority.
5. **Prefer default priorities**: If an image should have normal loading priority, omit the `fetchpriority` attribute entirely rather than setting it to `auto`. This is a stylistic convention to keep your HTML cleaner while relying on the browser's native heuristics.

## Example code

```html
<!-- Elevate priority for the LCP image -->
<img src="/images/hero-lcp.jpg"
     alt="Main Banner"
     fetchpriority="high"
     width="800" height="400">

<!-- Deprioritize initially hidden images above the fold -->
<img src="/images/gallery-alt.jpg"
     alt="Gallery Image"
     fetchpriority="low"
     width="400" height="300">

<!-- Deprioritize images revealed only after user interaction -->
<img src="/images/mega-menu-promo.jpg"
     alt="Special Offer"
     fetchpriority="low"
     width="300" height="150">

<!-- Use lazy loading ALONE for standard below-the-fold images -->
<img src="/images/footer-logo.png"
     alt="Footer Logo"
     loading="lazy"
     width="120" height="60">

<!-- Omit fetchpriority for images with standard priority -->
<img src="/images/standard-image.jpg"
     alt="Standard Image"
     width="400" height="300">
```

## Best practices

- **MANDATORY**: Always apply `fetchpriority="high"` to the LCP image.
- **MANDATORY**: Only use `fetchpriority="high"` on at most 1-2 critical images to avoid network contention and diluting the priority boost.
- **MANDATORY**: Use `fetchpriority="low"` for images that are technically "above the fold" but initially hidden (e.g., hidden carousel slides, mega menu images).
- **MANDATORY**: **Do not** use `fetchpriority="low"` on standard below-the-fold images that are already using `loading="lazy"`. These images should load at normal priority once they enter the viewport.
- **RECOMMENDED**: Avoid using `fetchpriority="auto"`. If you want the default priority, omit the attribute entirely to keep your HTML clean.
- **DO NOT** combine `fetchpriority="high"` with `loading="lazy"` for the LCP image.
- **DO NOT** use the deprecated `importance` attribute. It has been replaced by `fetchpriority` and is not supported by any browser.

## Fallback strategy

Baseline status for Fetch priority: Newly available. It's been Baseline since 2024-10-29.
Supported by: Chrome 103 (Jun 2022), Edge 103 (Jun 2022), Firefox 132 (Oct 2024), and Safari 17.2 (Dec 2023).

The `fetchpriority` attribute is a progressive enhancement for the `<img>` element. If a browser does not support it, the attribute is ignored, and the browser uses its default priority heuristics.


--- Guide for visually-stable-font-fallbacks ---
When web fonts load, they often replace a fallback font that has different dimensions, even if both are set to the same `font-size`. This causes "layout shift" (Cumulative Layout Shift) and can make text illegible if the fallback's lowercase letters (x-height) are significantly different than the preferred font.

The `font-size-adjust` property solves this by normalizing the size of the font based on a specific metric (usually the x-height), ensuring that text occupies the same visual space regardless of which font is currently active.

## Implementation steps

### 1. Identify the aspect ratio of your preferred font
To normalize fallbacks, you need the "aspect value" (the ratio of lowercase letters to the font size) of your primary font.

*   **Automatic discovery (Recommended):** Use the `from-font` keyword to let the browser extract the ratio from your primary web font.
*   **Manual calculation:** If you know the specific value (e.g., 0.545 for Verdana), you can provide it directly for more precise control.

### 2. Apply font-size-adjust to the text container
Apply the property to the element or a parent container. This ensures that if the primary font fails to load or is in the process of loading, the fallback font is scaled to match the visual size of the primary font.

```css
.text-content {
  /* Define your font stack as usual */
  font-family: "MyWebFont", "Arial", sans-serif;
  font-size: 1rem;

  /* MANDATORY: Normalize the font size based on the primary font's x-height.
     This ensures that if 'Arial' is used as a fallback, it is scaled 
     to match the x-height of 'MyWebFont'. */
  font-size-adjust: from-font;
}
```

### 3. (Optional) Adjust for specific metrics
While x-height is the default and most common, you can normalize by other metrics like `cap-height` (useful for all-caps headers) or `ch-width` (useful for monospaced fonts).

```css
h1 {
  /* Normalize based on the height of capital letters */
  font-size-adjust: cap-height from-font;
}
```

### 4. Verify visual stability
Ensure that the `font-size-adjust` value correctly aligns the fallback. You can test this by temporarily blocking the web font or adjusting the `font-family` declaration in your browser's DevTools and verifying that the text layout remains stable.

## Fallback strategies

Baseline status for font-size-adjust: Newly available. It's been Baseline since 2024-07-25.
Supported by: Chrome 127 (Jul 2024), Edge 127 (Jul 2024), Firefox 118 (Sep 2023), and Safari 17 (Sep 2023).

In browsers that do not support `font-size-adjust`, the font will be rendered at its default scale. This may result in layout shifts or changes in readability during font swaps. 

To mitigate this without `font-size-adjust`, you can use the `@font-face` descriptors `size-adjust`, `ascent-override`, and `descent-override` to manually tune fallback fonts, though these are more complex to calculate than a single `font-size-adjust` value.


--- Guide for improve-text-layout-and-legibility ---
# Improve Text Layout and Legibility

The layout of text, particularly at the ends of lines and and ends of paragraphs, can impact the legibility and aesthetic appeal of a page. CSS provides several text wrapping options that can improve specific use cases.

For short text blocks like headings, use `text-wrap: balance`. This property instructs the browser to distribute text as evenly as possible across lines, creating a more symmetrical appearance.

The `text-wrap: pretty` CSS property allows you to improve the typographic quality of body text by enabling a more sophisticated wrapping algorithm. It is specifically designed to prevent "orphans" (single words on the last line of a paragraph) and create a more pleasing visual "rag" for long blocks of text.

## Implementation

### 1. **Identify text elements**: 

For `text-wrap: balance`, select short text blocks like headings and table headers. Avoid elements that have visible boxes such as borders or backgrounds, as this can create unexpected visually empty areas in the layout.

For `text-wrap: pretty`, select elements potentially containing long runs of text where orphaned words (runts) or poor line breaks are most noticeable. This includes the following elements:
  - `<p>`
  - `<blockquote>`
  - `<li>`
  - Any other element potentially containing long runs of text.

#### Choosing the Right Wrapping Method

| Criteria | `text-wrap: balance` | `text-wrap: pretty` | `text-wrap: wrap` (Default) |
| :--- | :--- | :--- | :--- |
| **Best For** | Short blocks (Headings, Titles) | Long blocks (Paragraphs, Lists) | Performance-critical content |
| **Visual Goal** | Symmetrical line lengths | Avoiding orphans ("runts") | Fast, standard wrapping |
| **Line Constraints** | Up to 6–10 lines (algorithm limit) | Best for 3 to many lines | No limit |
| **Perf Cost** | **High**: Binary search algorithm | **Medium**: Look-back algorithm | **Low**: Standard greedy algorithm |

### 2. **Apply the chosen wrapping**: 

Apply `text-wrap: balance` specifically to short, multi-line elements such as headings (`h1`-`h6`), subheadings, or pullquotes.

```css
/* Target specific heading elements for balanced wrapping */
h1, h2, h3, h4, h5, h6 {
  /* Enables balanced line-breaking logic */
  text-wrap: balance;
}
```

Use `text-wrap: pretty` to enable an optimized algorithm that evaluates the last few lines of a paragraph to find the best break points.

```css
/* Apply to multi-line text blocks to prevent orphaned words */
p, blockquote, li, .pretty-text {
  /* Enables pretty line-breaking logic for body copy */
  text-wrap: pretty;
}
```

### Critical Constraints and Performance

#### text-wrap: balance

*   **Line Limit:** Browsers impose a limit on the number of lines they will attempt to balance to maintain performance (typically **6 lines** in Chromium and **10 lines** in Firefox). If the text exceeds this limit, the browser reverts to standard `wrap` behavior. Avoid using `text-wrap: balance` on text blocks that are likely to exceed these limits.
*   **Targeted Application:** DO NOT apply `text-wrap: balance` globally (e.g., `* { text-wrap: balance; }`). The iterative "binary search" algorithm used by browsers is computationally expensive. Limit its use to specific, short text elements.
*   **Interaction with Width:** `text-wrap: balance` does not change the container's width (`inline-size`). It only affects how text wraps *within* that width. This can leave empty space at the end of the container, which may affect layouts relying on full-width text blocks.

#### text-wrap: pretty

*   **Performance vs. Quality**: MANDATORY: `text-wrap: pretty` is more computationally expensive than the default `wrap` (greedy) algorithm because it evaluates multiple lines (typically the last four) to optimize the break points. Avoid applying it globally to every element if your page has an extreme amount of text content.
*   **Best for multi-line text**: The benefits of `pretty` are most apparent in paragraphs of three or more lines. It has little to no effect on short, single-line text.
*   **Browser-specific behavior**: Be aware that implementation details vary. Chromium-based browsers typically focus on the last four lines, while other engines may evaluate the entire paragraph.

### Fallback strategies

Baseline status for text-wrap: balance: Newly available. It's been Baseline since 2024-05-13.
Supported by: Chrome 114 (May 2023), Edge 114 (Jun 2023), Firefox 121 (Dec 2023), and Safari 17.5 (May 2024).
text-wrap: pretty has limited availability.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), and Safari 26 (Sep 2025).
Unsupported in: Firefox.

In browsers that do not support `text-wrap: balance` or `text-wrap: pretty`, the property is ignored, and the text will wrap using the default `wrap` behavior. This is a progressive enhancement that gracefully degrades to standard typography. This ensures that your content remains perfectly readable across all browsers while providing a superior experience to those that support it.

For critical layouts where refined text layout is a requirement, use a JavaScript library, but be aware that this may be slow and cause performance issues.

--- Guide for same-document-transitions ---
# Same Document Transitions

## The Problem

Web sites often provide multiple views of an object, for instance a list of products, and then a detail page for each product. Navigating between the two views often feels disconnected. When a user clicks a product thumbnail to view its details, the thumbnail disappears and a new, larger image appears instantly elsewhere on the screen. This lack of continuity makes it harder for users to track relationships between elements.

## The Solution

The **View Transitions API** allows you to specify element pairs that exist in different states before and after a transition. When triggering a transition with `document.startViewTransition()` in a Single Page Navigation (SPA), the browser identifies these shared elements by their shared unique `view-transition-name`. It then automatically calculates the difference in their position, size, and styling, and animates them smoothly from the old state to the new state. This transition occurs in the top layer, above even elements with high `z-index` values.

## Implementation Guide

### Step 1: Wrap State Changes in `startViewTransition`

For Single-Page Applications (SPAs) or simple state changes, wrap the logic that updates the DOM in `document.startViewTransition`. The browser captures a snapshot of the current state, runs the update, and then captures the new state. 

```javascript
function navigate(view) {
  // MANDATORY: Wrap the update in startViewTransition
  document.startViewTransition(() => updateDOM(view));
}
```

### Step 2: Assign Shared Transition Names

Use the `view-transition-name` CSS property to tell the browser which elements should be morphed. The name can be anything (except `none`). **MANDATORY**: there must be no more than 1 element before and after with a given `view-transition-name`. If there are 2 or more elements with a given `view-transition-name`, the DOM will be updated to the new state immediately, without a transition.

You can use multiple `view-transition-name`s to morph multiple pairs of elements. For example, you may want to transition both the product image and title with separate transitions.

Because there are multiple items on the list view, you can not give the all of them the same `view-transition-name`. This can be solved in two ways in a SPA.

1. **Dynamic detail page:** Assign each item on the list page a unique `view-transition-name`, and then dynamically apply that name to the matching element on the detail page when the list item is selected, as shown here.

```css
/* In the list view, give each */
#product-1 { view-transition-name: p1 }
#product-2 { view-transition-name: p2 }
#product-3 { view-transition-name: p3 }
```

```js
function updateDOM(clickedTransitionName){
  const hero = document.getElementById("hero");
  hero.style.viewTransitionName = clickedTransitionName;
}
```

2. **Dynamic list item:** Assign the element on the detail page a `view-transition-name`, and apply that name to the item on the list page when it is selected. Remove the `view-transition-name` from the item on the list page when returning to the list page.

The `#hero` element on the detail page and the selected `.thumbnail` element on the list page share a `view-transition-name`. 

```css
#hero{
  view-transition-name: hero;
}
.thumbnail.selected {
  view-transition-name: hero;
}
```

When a thumbnail is clicked, we need to prepare the list view by assigning the `view-transition-name` using the `.selected` class selector, and making any changes to the DOM before starting the transition.

Then, you can call `document.startViewTransition()`, and apply the changes to transition the page from the detail to list view.

After navigating back to the list view, you must clean up the view transition classes to prevent the next navigation from erroring. You can perform this cleanup after the transition's `finished` promise resolves.

```javascript
// Function called when a thumbnail is clicked
function goFromListToDetail(e){
  e.currentTarget.classList.add("selected");
  const hero = document.getElementById("hero");
  const bgColor = getComputedStyle(e.currentTarget).backgroundColor;
  hero.style.background = bgColor;

  // Trigger the transition, checking for support
  if (!document.startViewTransition) {
    document.body.classList.add("detail");
    // MANDATORY Accessibility Routing: Route focus to the newly revealed heading to announce context and preserve logical tab flow
    document.getElementById("detail-heading")?.focus();
    return; // MANDATORY: End function execution if view transitions are not supported.  
  }
  const transition = document.startViewTransition(() => {
    document.body.classList.add("detail");
  });
  // MANDATORY Accessibility Routing: Route focus after the view transition resolves
  transition.finished.finally(() => {
    document.getElementById("detail-heading")?.focus();
  });
}

// Function called when navigating from detail back to list view
function goFromDetailToList() {
  if (!document.startViewTransition) {
    document.body.classList.remove("detail");
    document.getElementById("list-heading")?.focus();
    return;
  }
  const transition = document.startViewTransition(() => {
    document.body.classList.remove("detail");
  });
  // Clean up the list view and route focus
  transition.finished.finally(() => {
    // Route focus back to list view
    document.getElementById("list-heading")?.focus();
    // Remove selected classList to remove view-transition-names
    document.querySelectorAll(".selected").forEach(
      (element) => {
        element.classList.remove("selected");
      },
    );
  });
}
```

The method you choose will depend on the use case. The dynamic list item requires less repeated CSS, but more manual JavaScript cleanup.


### Step 3: Fix Aspect Ratio "Stretching"

By default, the browser cross-fades the old and new snapshots within a group that stretches to fit both. If you are transitioning text, set the width of the text element to `fit-content` on both the old and new views, so that the transitioned element's aspect ratio is stable.

```css
#list-page .title {
  width: fit-content;
}

#detail-page #title {
  width: fit-content;
}
```

If you are transitioning elements that change aspect ratio, you may need to set the height of the old and new pseudo-elements to 100% of the `::view-transition-pair()` pseudo-element.

```css
::view-transition-old(hero),
::view-transition-new(hero){
  height: 100%;
}
```

The pseudo-elements are snapshots of the live elements, so you can also use `object-fit` and `object-position` declarations for more control of the transitioning effect.

## Best Practices

-   **DO NOT** specify too many transitions. Only use shared elements for primary content that the user is actively tracking (e.g., hero images, headings).
-   **DO** remove temporary `view-transition-name` values after the transition finishes to avoid side effects on future transitions.
-   **DO NOT** transition elements with active animations. View transitions operate on snapshots, so any animations will appear to be paused during the view transition.
-   **DO** respect user preferences for reduced motion using the `prefers-reduced-motion` media query.
-   **MANDATORY Accessibility Routing**: View transitions morph page layouts dynamically but do not manage programmatic focus. If focus remains on an element that is hidden or removed during the transition, focus is abandoned, leaving keyboard and assistive technology users without context. Shift focus programmatically to an updated page heading or view container (using `tabindex="-1"`) immediately after the DOM updates or when the view transition's `finished` promise resolves.

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

## Fallback Strategies

Baseline status for View transitions: Newly available. It's been Baseline since 2025-10-14.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 144 (Oct 2025), and Safari 18 (Sep 2024).

The View Transitions API is designed for progressive enhancement. Browsers that do not support it will simply execute the DOM update immediately without animation.

```javascript
function navigate(){
  if (!document.startViewTransition) {
    // Fallback: Just update the DOM
    updateDOM();
  } else {
    document.startViewTransition(() => updateDOM());
  }
}
```

