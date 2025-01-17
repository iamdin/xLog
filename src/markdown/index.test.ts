import { describe, expect, test } from "vitest"

import { renderPageContent } from "./index"

describe("html", () => {
  test("simple", async () => {
    const { contentHTML, excerpt } = await renderPageContent(
      `
# Hello
  
  This is the **excerpt**
    
  > Hello Blockquote <sup>foo</sup>
  
  - [ ] task list 
  - [x] done
  
  <script>alert('xss')</script>
  
  <img src="foo.png" alt="my image" onerror="console.log(1)" />
  
  <figcaption><a href="https://example.com">my caption</a></figcaption>
  
  <img src />
  
  \`\`\`js
  function foo() {}
  
  <script>alert('xss')</script>
  \`\`\`
  
  \`\`\`
  <script>alert('xss')</script>
  \`\`\`
    `,
      true,
    )

    expect(contentHTML).not.toMatch(/<script>/)
    expect(excerpt).toMatchInlineSnapshot(`
      "This is the excerpt Hello Blockquote foo

       task list  done
      my caption
      Copy
      function foo() {}

      <script>alert('xss')</script>

      C…"
    `)
  })

  test("wrap table", async () => {
    const { contentHTML } = await renderPageContent(
      `|a|b|
  |---|---|
  |c|d|  
    `,
      true,
    )
    expect(contentHTML.trim()).toMatchInlineSnapshot(
      '"<div class=\\"table-wrapper\\"><table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>c</td><td>d</td></tr></tbody></table></div>"',
    )
  })

  test("callout", async () => {
    const { contentHTML } = await renderPageContent(
      `
  > TIP:
  >
  > Some tip!
  
  > WARN:
  >
  > Some warning!
    `,
      true,
    )

    expect(contentHTML).toMatchInlineSnapshot(`
      "<blockquote class=\\"callout callout-tip\\">
      <p>Some tip!</p>
      </blockquote>
      <blockquote class=\\"callout callout-warn\\">
      <p>Some warning!</p>
      </blockquote>"
    `)
  })
})
