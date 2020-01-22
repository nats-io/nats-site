// General Javascript

// On Page Load
$(function() {

  // Lets make sure we're on the about page before running this
  if($("#throughputChart").length > 0) {
    // Get the context of the canvas element we want to select
    var ctx = $("#throughputChart");
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
});
