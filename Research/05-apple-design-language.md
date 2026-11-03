# Apple design language for a web dashboard

Apple's Human Interface Guidelines (HIG) describe the style people call "Apple design". The rules below are the ones that apply to a browser dashboard, with how this project uses each.

## Principles used

| HIG guidance | How the dashboard applies it | Source |
|---|---|---|
| "Order content by relative importance." "Group related items." Use negative space, container shapes or separators to show grouping. | One store panel with clear sections; rounded cards with generous spacing instead of borders and boxes. | [4] |
| "Use progressive disclosure to make layouts cleaner." | Overview shows the summary; Demographics, Sales and Competitors open as tabs. | [4] |
| "Differentiate controls from content." | Segmented control for tabs; translucent top bar above content. | [4] |
| "Minimize the number of typefaces." Avoid Ultralight, Thin and Light weights. | One family: the system font stack (SF Pro on Apple devices). Weights 400 to 700 only. | [2] |
| Standard materials blur and adjust background luminosity; "use Liquid Glass effects sparingly", never on the content layer. | Frosted glass (`backdrop-filter`) only on the floating map panel and top bar. Content cards are solid. | [3] |
| "Avoid relying solely on color" to communicate information. | Every chart has labels and text summaries; status uses icons and words, not colour alone. | [1], [5] |
| Contrast "no lower than 4.5:1"; aim for 7:1 for small text. | Text tokens checked against both themes. | [6] |
| "Ensure that your app looks good in both appearance modes." Avoid an app-specific appearance setting. | Follows the operating system's light or dark setting via `prefers-color-scheme`. | [6] |
| "Keep a chart simple." "Prefer common chart types." Few grid lines, light labels. Bar charts start at zero. | Bar and line charts only; light horizontal grid; y-axis from zero; one-line takeaway above each chart. | [5], [7] |
| "Make every chart in your app accessible" with labels that describe values. | Each chart has an `aria-label` summary and a data table fallback. | [5], [7] |
| "Soften the color of white backgrounds." | Page background is Apple's grouped background grey, cards are white. | [6] |

## System colours used (RGB from the HIG colour table)

The HIG says not to hard-code system colours in native apps because they change between releases. A web page cannot read them, so these values are copied as design tokens.

| Token | Light | Dark |
|---|---|---|
| Blue (accent) | 0, 136, 255 | 0, 145, 255 |
| Green (positive) | 52, 199, 89 | 48, 209, 88 |
| Red (negative / SDM brand accent) | 255, 56, 60 | 255, 66, 69 |
| Orange (warning) | 255, 141, 40 | 255, 146, 48 |
| Indigo | 97, 85, 245 | 109, 124, 255 |
| Teal | 0, 195, 208 | 0, 210, 224 |

Source: [1]. Values were read from a summarised extract of the HIG colour page; check against the page before reuse.

## Typography scale (iOS Dynamic Type, default size)

Body and Headline are 17 pt with 22 pt leading at the default size [2]. The dashboard uses 17 px body text on desktop, 28 to 34 px titles, 13 px captions, and never smaller than 11 px.

## Sources

1. Apple HIG, Color. https://developer.apple.com/design/human-interface-guidelines/color
2. Apple HIG, Typography. https://developer.apple.com/design/human-interface-guidelines/typography
3. Apple HIG, Materials. https://developer.apple.com/design/human-interface-guidelines/materials
4. Apple HIG, Layout. https://developer.apple.com/design/human-interface-guidelines/layout
5. Apple HIG, Charting data. https://developer.apple.com/design/human-interface-guidelines/charting-data
6. Apple HIG, Dark Mode. https://developer.apple.com/design/human-interface-guidelines/dark-mode
7. Apple HIG, Charts. https://developer.apple.com/design/human-interface-guidelines/charts
