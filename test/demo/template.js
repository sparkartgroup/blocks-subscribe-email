(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['customTemplate'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<label class=\"subscribe-email__label\" for=\""
    + escapeExpression(((helper = (helper = helpers.emailName || (depth0 != null ? depth0.emailName : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"emailName","hash":{},"data":data}) : helper)))
    + "\">Email Addrezz</label>\n<input class=\"subscribe-email__input subscribe-email__input--email\" type=\"email\" name=\""
    + escapeExpression(((helper = (helper = helpers.emailName || (depth0 != null ? depth0.emailName : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"emailName","hash":{},"data":data}) : helper)))
    + "\" required>\n<button class=\"subscribe-email__button\" type=\"submit\">"
    + escapeExpression(((helper = (helper = helpers.submitText || (depth0 != null ? depth0.submitText : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"submitText","hash":{},"data":data}) : helper)))
    + "</button>\n<p class=\"subscribe-email__response\"></p>";
},"useData":true});
})();