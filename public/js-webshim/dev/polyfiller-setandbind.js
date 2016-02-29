webshims.setOptions("forms-ext", {
  "widgets": {
    openOnFocus: true,
    popover: {
      appendTo: "body"
    }
  },
  date: {
    startView: 2
  },
  month: {
    startView: 1
  },
  "datetime-local": {
    startView: 3
  }
});

webshims.polyfill("forms forms-ext");
