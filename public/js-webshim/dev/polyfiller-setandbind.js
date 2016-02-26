webshims.setOptions("forms-ext", {
  replaceUI: 'true',
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
