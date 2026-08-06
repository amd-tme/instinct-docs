/**
 * Landing page — "show more" behavior for System Administrators card grids.
 *
 * MAT-49 made each subgroup (Bare metal, Containers & orchestration,
 * Cluster/cloud & virtualization) a native <details class="id-group">: the
 * whole grid was hidden until the <summary class="id-subhead"> was clicked.
 *
 * MAT-107 keeps that whole-group collapse behavior (native, no JS needed)
 * but adds a partial reveal *inside* an open group: only the first 3 cards
 * show by default, followed by a "Show N more" banner that expands the
 * grid to reveal the rest (and can collapse it back down). This keeps every
 * group scannable at a glance without requiring a click just to see what's
 * inside, per MAT-107.
 *
 * Markup produced per qualifying `.id-group > .id-grid` (grids with more
 * than 3 `.id-card` children):
 *
 *   <div class="id-grid">
 *     <a class="id-card">...</a>          (1st of first 3, kept in place)
 *     <a class="id-card">...</a>          (2nd of first 3, kept in place)
 *     <a class="id-card">...</a>          (3rd of first 3, kept in place)
 *     <button class="id-more-toggle">...</button>   (inserted)
 *     <div class="id-grid-more" hidden>              (inserted wrapper)
 *       <a class="id-card">...</a>        (4th+ cards, moved here)
 *       ...
 *     </div>
 *   </div>
 *
 * `.id-grid-more` uses `display: contents` when visible so its children
 * still participate directly in the parent `.id-grid` CSS grid, and
 * `display: none` (via the `hidden` attribute) when collapsed.
 *
 * Grids with 3 or fewer cards are left untouched — no banner is added.
 */
(function () {
    "use strict";

    const CARDS_SHOWN_BY_DEFAULT = 3;

    const chevronSvg =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="m6 9 6 6 6-6"/></svg>';

    function labelFor(remaining, expanded) {
        if (expanded) {
            return "Show less";
        }
        return "Show " + remaining + " more";
    }

    function setupGrid(grid, idIndex) {
        const cards = Array.prototype.filter.call(grid.children, function (el) {
            return el.classList.contains("id-card");
        });

        if (cards.length <= CARDS_SHOWN_BY_DEFAULT) {
            return;
        }

        const overflowCards = cards.slice(CARDS_SHOWN_BY_DEFAULT);
        const remaining = overflowCards.length;

        const wrapper = document.createElement("div");
        wrapper.className = "id-grid-more";
        wrapper.id = "id-grid-more-" + idIndex;
        wrapper.hidden = true;

        // Move the overflow cards into the wrapper, preserving order.
        grid.insertBefore(wrapper, overflowCards[0]);
        overflowCards.forEach(function (card) {
            wrapper.appendChild(card);
        });

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "id-more-toggle";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", wrapper.id);
        toggle.innerHTML =
            '<span class="id-more-label">' + labelFor(remaining, false) + "</span>" +
            '<span class="id-more-icon">' + chevronSvg + "</span>";
        grid.insertBefore(toggle, wrapper);

        const label = toggle.querySelector(".id-more-label");

        function setExpanded(expanded) {
            toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
            toggle.classList.toggle("id-more-toggle--open", expanded);
            wrapper.hidden = !expanded;
            label.textContent = labelFor(remaining, expanded);
        }

        toggle.addEventListener("click", function () {
            setExpanded(toggle.getAttribute("aria-expanded") !== "true");
        });

        // The "More" control only makes sense once its parent group is
        // open. Re-collapse the overflow whenever the group itself is
        // closed, so reopening the group always starts back at the
        // top-3 view rather than resuming a stale expanded state.
        const group = grid.closest(".id-group");
        if (group) {
            group.addEventListener("toggle", function () {
                if (!group.open) {
                    setExpanded(false);
                }
            });
        }
    }

    function init() {
        const grids = document.querySelectorAll(".id-group > .id-grid");
        grids.forEach(function (grid, index) {
            setupGrid(grid, index);
        });
    }

    // This file is loaded via a plain (non-deferred) <script> in <head>, so
    // the .id-group/.id-grid elements in <body> don't exist yet when it
    // first runs — wait for the DOM before querying for them.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
