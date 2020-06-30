{{ $googleAnalyticsId := site.Params.google_analytics_id }}

const navbarToggle = () => {
  const burger = $('.navbar-burger'),
    menu = $('.navbar-menu');

  burger.click(() => {
    [burger, menu].forEach((el) => el.toggleClass('is-active'));
  });
}

var googleAnalyticsToggle = () => {
  const selector = $('#disable-analytics'),
    gaDisableKey = 'ga-disable-{{ $googleAnalyticsId }}';

  const oneYearFromNow = () => {
    var d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }

  const closeRibbon = () => {
    var gdprSel = $('#gdpr');
    if (!gdprSel.hasClass('hide')) {
      $('#nav').css({top: "0px"});
      gdprSel.addClass('hide');
      if (paddingTop) {
          $('body').css("padding-top", paddingTop + "px");
      }
      // they closed the notice, so they accepted
      if (getCookie() === undefined) {
          enableAnalytics();
      }
    }
  }

  const getCookie = () => {
    const cookies = document.cookie;
    const a = cookies.split(';');
    return a.find(function (e) {
      e = e.trim();
         return e.startsWith("ga-disable=");
     });
  }

  const updateCheckbox = (tc) => {
    var checked = false;
    if (tc) {
        checked = tc.trim().split('=')[1] == "true";
    }
    $('#disable-analytics').prop('checked', checked);
    return checked;
  }

  const deleteCookie = (name) => {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  const addGoogleAnalytics = () => {
    if (!$('#gascript').length) {
      var s = document.createElement('script', {async: '', id: 'gascript'});
      s.type = 'text/javascript';
      s.src = 'https://www.google-analytics.com/analytics.js';
      $('body').append(s);
    }
  }

  const checkTrack = () => {
    var tc = getCookie();
    var disable = updateCheckbox(tc);
    // set a property on the window to disable ga
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-opt-out
    window[gaDisableKey] = disable;

    if (!tc) {
        // while this is opened, we don't track or download scripts
        openPrivacy(tc);
    } else {
      addGoogleAnalytics();
    }
  }

  const openPrivacy = (tc) => {
    var gdprSel = $('#gdpr');
    gdprSel.removeClass('hide');
    return handleSizes();
  }

  const handleSizes = () => {
    var paddingTop = 0;

    const gdprSel = $('#gdpr');
    if (!gdprSel.hasClass('hide')) {
      const h = gdprSel.innerHeight();
      const body = $('body');
      const pt = parseInt(body.css('padding-top'), 10);
      if (paddingTop === 0) {
        paddingTop = pt;
      }
      body.css("padding-top", (paddingTop + h) + "px");
      $('#nav').css({top: h + "px"});
      gdprSel.css({top: 0, position: "fixed", zIndex: 2000, width: "100%"});
    }
  }

  const disableAnalytics = () => {
    window[gaDisableKey] = true;
    closeRibbon();
    var d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    document.cookie = "ga-disable=true; expires=" + oneYearFromNow().toUTCString() + "; path=/";
    addGoogleAnalytics();
  }

  const enableAnalytics = () => {
    window[gaDisableKey] = false;
    closeRibbon();
    var d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    document.cookie = "ga-disable=false; expires=" + oneYearFromNow().toUTCString() + "; path=/";
    addGA();
  }

  if (selector.length) {
    selector.change(() => {
      deleteCookie("ga-disable");
      if ($(this).is(':checked')) {
        disableAnalytics();
      } else {
        enableAnalytics();
      }
      return false;
    });
  }
}

function throughputChart() {
  const chart = $("#throughput-chart-container");

  // Lets make sure we're on the about page before running this
  if (chart.length > 0) {

    // Get the context of the canvas element we want to select
    var ctx = chart;
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["NATS", "ActiveMQ", "Kafka", "Kestrel", "ruby-nats", "NSQ", "RabbitMQ", "Redis"],
        datasets: [
          {
            label: "Sender Throughput",
            backgroundColor: "rgba(39,170,225,1)",
            borderColor: "rgba(39,170,225,1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(39,170,225,0.75)",
            hoverBorderColor: "rgba(39,170,225,1)",
            data: [195521.56, 24612.5, 97225.44, 18022.25, 76008.59, 12512.51, 16415.26, 81248.09]
          },
          {
            label: "Receiver Throughput",
            backgroundColor: "rgba(141,198,65,1)",
            borderColor: "rgba(141,198,65,1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(141,198,65,0.75)",
            hoverBorderColor: "rgba(141,198,65,1)",
            data: [195736.65, 22267.94, 74324.00, 17960.05, 75989.69, 12460.66, 16412.89, 81208.97]
          }
        ]
      },
      options:{
        responsive: true,
        maintainAspectRatio: true,
        scales:{
          yAxes:[{
            ticks:{
              beginAtZero:true
            }
          }]
        }
      }
    });
  }
}

// On page load
$(function() {
  navbarToggle();

  throughputChart();

  googleAnalyticsToggle();
});
