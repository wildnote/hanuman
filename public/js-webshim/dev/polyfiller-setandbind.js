webshims.setOptions("forms-ext", {
  date: {
    startView: 2,
    openOnFocus: true,
    popover: {
      appendTo: "body"
    }
  },
  "datetime-local": {
    startView: 3,
    openOnFocus: true,
    popover: {
      appendTo: "body"
    }
  }
});

webshims.polyfill("forms forms-ext");