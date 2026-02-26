const { textarea, text, script, domReady } = require("@saltcorn/markup/tags");
const iterator = require("markdown-it-for-inline");
const markdownItMermaid = require("markdown-it-mermaid");

const md = require("markdown-it")().use(
  iterator,
  "nofollow_links",
  "link_open",
  function (tokens, idx) {
    tokens[idx].attrPush(["rel", "nofollow"]);
  },
);
const md_mermaid = require("markdown-it")()
  .use(iterator, "nofollow_links", "link_open", function (tokens, idx) {
    tokens[idx].attrPush(["rel", "nofollow"]);
  })
  .use(markdownItMermaid.default);

const markdown = {
  name: "Markdown",
  sql_name: "text",
  fieldviews: {
    showAll: {
      isEdit: false,
      configFields: [
        { name: "mermaid", label: "Render mermaid diagrams", type: "Bool" },
      ],
      run: (v, _req, attr) =>
        attr?.mermaid
          ? md_mermaid.render(v || "") +
            script(
              domReady(
                `$(".mermaid:not([data-processed])").each(function(){
              const $e = $(this)
              $e.attr("mm-src", $e.text())
            });
            ensure_script_loaded("/static_assets/"+_sc_version_tag+"/mermaid.min.js")`,
              ),
            )
          : md.render(v || ""),
    },
    peek: {
      isEdit: false,
      run: (v) => text(v && v.length > 10 ? v.substring(0, 10) : v || ""),
    },
    edit: {
      isEdit: true,
      run: (nm, v, attrs, cls) =>
        textarea(
          {
            class: ["form-control", cls],
            name: text(nm),
            id: `input${text(nm)}`,
            rows: 10,
          },
          text(v) || "",
        ),
    },
  },
  read: (v) => {
    switch (typeof v) {
      case "string":
        return v;
      default:
        return undefined;
    }
  },
};

const render_markdown = {
  type: "String",
  handlesTextStyle: true,
  configFields: [
    { name: "mermaid", label: "Render mermaid diagrams", type: "Bool" },
  ],
  run: (v, _req, attr) =>
    attr?.mermaid
      ? md_mermaid.render(v || "") +
        script(
          domReady(
            `$(".mermaid:not([data-processed])").each(function(){
              const $e = $(this)
              $e.attr("mm-src", $e.text())
            })
            ensure_script_loaded("/static_assets/"+_sc_version_tag+"/mermaid.min.js")`,
          ),
        )
      : md.render(v || ""),
};

module.exports = {
  sc_plugin_api_version: 1,
  types: [markdown],
  fieldviews: { render_markdown },
  functions: { md_to_html: (m) => md.render(m || "") },
  ready_for_mobile: true,
};
