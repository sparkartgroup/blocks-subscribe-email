Subscribe Email is a UMD JavaScript module for rendering a mailing list sign up form quickly on a webpage.

It allows developers to quickly include an email collection form on a page without being concerned with the implementation details of a specific mailing list platform. We're currently aiming to support mailing lists on SendGrid, MailChimp and Universe.

# Getting Started

## 1) Get the Module
If you're doing things manually, you can download the ZIP and extract the contents of the `/dist` directory into your project's assets folder.

If you're using a package manager like [npm](https://www.npmjs.org/) or [Bower](http://bower.io/), you can install the module to your devDependencies.

## 2) Include the Module in Your Page
If you're doing things manually, just drop `<script src="subscribe-email.min.js">` into your page, and make sure you update the `src` attribute to point to wherever you saved the module.

Alternatively, you can bundle the module along with the rest of your projects assets using a tool like [Browserify](http://browserify.org/), [Grunt](http://gruntjs.com/), [Gulp](http://gulpjs.com/), etc.

## 3) Use the Module
After you've gotten the module and included it in your page, you can start using it.

1) Create an empty placeholder element where you want to include the form on the page. You can use any block-level HTML element, given that it has a unique way to select it;

`<div id="subscribe-form"></div>`

2) Create a new `SubscribeEmail` instance somewhere in the page's JavaScript. The only parameters that are required are `element`, which is a DOM element, jQuery element, or selector string to refer to the placeholder element and `service` which is the name of mailing list platform you are using. Depending on the service, you may need an API key, which you can define with the `key` parameter.
```
  new SubscribeEmail({
    element: '#subscribe-form',
    service: 'universe',
    key: 'your-api-key-here'
  });
```

3) Profit?

# Advanced Usage

## Options
The module can be configured with several optional parameters passed to it's constructor. Here is the full list of options:

- `element`: **(Required)** A DOM element, jQuery element, or selector string to refer to the placeholder element.
- `service`: **(Required)** The mailing list platform you are using. Available options are `mailchimp`, `sendgrid` and `universe`.
- `key`: An API key if required by your mailing list platform.
- `submitText`: A string to be used on the form's submit button. Defaults to "Subscribe".
- `template`: A string of the name of the compiled handlebars template to use to render the form. Available templates are `'BEM-with-messaging'` or `'BEM-minimal'` (default). See "Customizing the Templates" below for more information.
- `async`: Whether the form with be submitted asynchronously (defaults to false).

## Customizing the Template
The Subscribe Email module comes with some compiled Handlebars templates that you can choose from. If you want to create custom HTML template(s), you can add a Handlebars template to `/src/templates` and run `gulp build` from the module's root directory to build the module from source and compile the template (note: this may require running `npm install` first to install subscribe-email's devDependencies).

## Events
Some mailing list platforms may send response messages for things like confirmation or validation errors. The default template will display these messages along-side the form, but alternatively you can easily integrate the messages into other parts of your page by listening for the following events to fire;

- `subscriptionError`: This event will fire if the mailing list provider returns an error and fails to add the email address to the list. Specific details about the error will be included in a payload object when available.
- `subscriptionSuccess`: This event will fire if the mailing list provider returns a confirmation that the email address has been added to the list. Specific details will be included in a payload object when available.