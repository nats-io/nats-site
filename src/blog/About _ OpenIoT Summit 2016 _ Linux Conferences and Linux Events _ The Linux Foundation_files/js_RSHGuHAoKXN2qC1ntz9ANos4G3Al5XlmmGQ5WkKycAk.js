(function(a){"use strict";a.fn.fitVids=function(b){var c={customSelector:null},d=document.createElement("div"),e=document.getElementsByTagName("base")[0]||document.getElementsByTagName("script")[0];return d.className="fit-vids-style",d.innerHTML="&shy;<style>               .fluid-width-video-wrapper {                 width: 100%;                              position: relative;                       padding: 0;                            }                                                                                   .fluid-width-video-wrapper iframe,        .fluid-width-video-wrapper object,        .fluid-width-video-wrapper embed {           position: absolute;                       top: 0;                                   left: 0;                                  width: 100%;                              height: 100%;                          }                                       </style>",e.parentNode.insertBefore(d,e),b&&a.extend(c,b),this.each(function(){var b=["iframe[src*='player.vimeo.com']","iframe[src*='www.youtube.com']","iframe[src*='www.youtube-nocookie.com']","iframe[src*='www.kickstarter.com']","object","embed"];c.customSelector&&b.push(c.customSelector);var d=a(this).find(b.join(","));d.each(function(){var b=a(this);if(!("embed"===this.tagName.toLowerCase()&&b.parent("object").length||b.parent(".fluid-width-video-wrapper").length)){var c="object"===this.tagName.toLowerCase()||b.attr("height")&&!isNaN(parseInt(b.attr("height"),10))?parseInt(b.attr("height"),10):b.height(),d=isNaN(parseInt(b.attr("width"),10))?b.width():parseInt(b.attr("width"),10),e=c/d;if(!b.attr("id")){var f="fitvid"+Math.floor(999999*Math.random());b.attr("id",f)}b.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top",100*e+"%"),b.removeAttr("height").removeAttr("width")}})})}})(jQuery);;
/* =============================================================
 * bootstrap-collapse.js v2.1.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSIBLE PLUGIN DEFINITION
  * ============================== */

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSIBLE DATA-API
  * ==================== */

  $(function () {
    $('body').on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
      var $this = $(this), href
        , target = $this.attr('data-target')
          || e.preventDefault()
          || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
        , option = $(target).data('collapse') ? 'toggle' : $this.data()
      $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
      $(target).collapse(option)
    })
  })

}(window.jQuery);;
/**
 * Custom theme JavaScript code used sitewide
 */
(function ($) {

  /* @functionality: refresh accordions on resize */
  /*
  Drupal.behaviors.accordionRefresh = {
    attach: function (context, settings) {
      if ($(".ui-accordion", context).length > 0) {
        $(".ui-accordion", context).accordion("resize");
        $(window).bind('resize', function() {
          $(".ui-accordion", context).accordion("resize");
        });
      }
    }
  }
  */

  /* @functionality: makes videos responsive */
  Drupal.behaviors.fluidVideos = {
    attach: function (context, settings) {
      if ($(".embedded-video", context).length > 0) {
        $(".embedded-video", context).fitVids();
      }
    }
  }

  /* @functionality: Hides and shows the comments listing on review overlay. */
  Drupal.behaviors.showHideComments = {
    attach: function (context, settings) {
      $(".page-cfp .pane-node-comments h2.pane-title").click(function () {
        $(".page-cfp .pane-node-comments .pane-content").slideToggle();
      });
    }
  };

  /* @functionality: Conditionally add divider class to ensure height of bar is consistent. */
  Drupal.behaviors.sponsorDividerConditional = {
    attach: function (context, settings) {
      $("#mini-panel-event_diamond_platinum_gold_spon .region, #mini-panel-event_silver_bronze_sponsors .region").each(
        function(){
          if ($(this).find(".views-row").length) {
            if($(this).prev().height() > $(this).height()) {
              $(this).prev().addClass('right-border');
            }
            if($(this).next().height() >= $(this).height()) {
              $(this).next().addClass('left-border');
            }
          }
        }
      );
    }
  };

  var hasFlash = function(){
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) {
        return true;
      }
    } catch (e) {
      if (navigator.mimeTypes
            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
        return true;
      } else {
        return false;
      }
    }
  }

  Drupal.behaviors.shadowboxDisableVideoIfnoFlash = {
    attach: function (context, settings) {
      $('.page-events #mini-panel-event_last_year_highlights a, .page-events .shadowboxed-video', context).once( 'shadowboxDisableVideoIfnoFlash', function () {
        if( !hasFlash() ) {
          var youtube_link = $(this);
          var youtube_mobile_url = '';

          // Trap click events on images so that shadowbox auto behavior doesn't kick in
          youtube_link.find('img').click( function(event) {
            event.stopPropagation();
          });

          // Try mobile Youtube without Shadowbox
          youtube_link.removeAttr('rel');
          youtube_mobile_url = youtube_link.attr('href').replace('www.youtube.com/v/', 'm.youtube.com/watch?v=').replace('?html5=1&autoplay=1', '?autoplay=1');
          youtube_link.attr('href', youtube_mobile_url );
        }
      });
    }
  };

  Drupal.behaviors.eventsHighlightsHideIfEmpty = {
    attach: function (context, settings) {
      $('#mini-panel-event_last_year_highlights', context).once( 'eventsHighlightsHideIfEmpty', function () {
        // Last Year's Highlights mini-panel contains two regions in row-1
        $('#mini-panel-event_last_year_highlights > .row-1 > .region > .region-inner', context).each(function() {
          // If one region is empty then hide it and expand the other one.
          if ($(this).find('.panel-pane').length == 0) {
            $(this).parent().hide();
            $(this).parent().parent().find('.region:visible').css({
              width: '100%',
              height: 330
            });
          }
        });
      });
    }
  };

  Drupal.behaviors.loginToCFPLink = {
    attach: function (context, settings) {
      $('.pane-events-events-submenu', context).once( 'loginToCFPLink', function () {
        $(this).find('.pane-container').append('<div class="login-to-cfp"><ul><li><a href="/cfp/dashboard">'+Drupal.t('CFP Dashboard')+'</a></li></ul></div>')
      });
    }
  };

  $('select#edit-field-presentation-event-und').chosen();
  $('select#edit-field-presentation-event-und--2').chosen();
  $('select#edit-field-presentation-event-target-id').chosen();
  $('.view-display-id-event_listing_jump_menu select#edit-jump').chosen();
  //hide sponsor logos
  if( $('#sponsor_display_cat_1').length == 0 && $('#sponsor_display_cat_2').length == 0 && $('#sponsor_display_cat_3').length == 0) {
    $('.pane-event-diamond-platinum-gold-spon').hide();
  }

})(jQuery);
;
