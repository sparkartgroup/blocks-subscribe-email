Subscribe Email is a UMD JavaScript module for rendering a mailing list sign up form quickly on a webpage.

It allows developers to quickly include an email collection form on a page without being concerned with the implementation details of a specific mailing list platform. We're currently aiming to support mailing lists on SendGrid, MailChimp and Universe.

# Including the Module in Your Project
You can include the module any way that fits with your workflow;

**If you use bower (recommended):**
`bower install subscribe-email --save`

**If you use npm:**
`npm install subscribe-email --save`

**If you're not using a package manager:**
Just copy and paste the `/dist` directory to wherever you want it in your project.


# Wiring Things Up
Once you've got the module included in your project, getting started using it is simple.

1. Include subscribe-email.js in your page. You can use your preferred script loader, concatenate it with the rest of your scripts during your build process, or just drop `<script src="subscribe-email.min.js">` into your page. Just make sure you update the path to point to wherever you've saved or included it.
2. Create an empty placeholder element for the subscription form on the page; `<div id="subscribe-form"></div>`.

## Quick Start

Create a new `SubscribeEmail` instance somewhere in the page's JavaScript. The only parameter that's required is the `element`. You can either use the ID of the placeholder HTML element you created or pass in a jQuery object;
```
  new SubscribeEmail({
    element: subscribe-form
  });
```

## Advanced Options

There are also some advanced configuration options available.
```
  new SubscribeEmail({
    element: subscribe-form, //required
    template: 'minimal-BEM', //defaults to 'minimal-BEM'
    async: true //defaults to false
  });
```

## Customizing the Template
The Subscribe Email module comes with some compiled Handlebars templates that you can choose from. If you want to create custom HTML template(s), you can add a Handlebars template to `/src/templates` and run `gulp build` from the project directory to build the module from source and compile the template.

## Events
Some mailing list platforms may send response messages for things like confirmation or validation errors. The default template will display these messages along-side the form, but alternatively you can easily integrate the messages into other parts of your page by listening for the following events to fire;

`subscriptionError`: This event will fire if the mailing list provider returns an error and fails to add the email address to the list. Specific details about the error will be included in a payload object when available.
`subscriptionSuccess`: This event will fire if the mailing list provider returns a confirmation that the email address has been added to the list. Specific details will be included in a payload object when available.