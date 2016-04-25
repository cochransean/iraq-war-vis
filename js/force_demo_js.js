var width = 500,
    height = 1000;

var svg = d3.select("#force-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .gravity(.1);

var data;

d3.csv("data/ethnicity_final_cleaned.csv",function(error, links){

    if (error) throw error;

    links.filter(function(link){
        link.sunni_0 = +link.sunni_0;
        link.kurd_0 = +link.kurd_0;
        link.shia_0 = +link.shia_0;
        link.total_0 = +link.total_0;
    });

    console.log(links);

    data = links;

    updateVisualization();
    $('#button').click();

});

function updateVisualization(){

    var district = d3.select("#button").property("value");

    var circle1 = svg.selectAll('.circle1')
        .data(data);

    circle1
        .enter()
        .append('circle')
        .attr("circle1");

    circle1
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.sunni_0;
        })
        .attr("cx",250)
        .attr("fill","green")
        .attr("cy", function(d){
            if (d.total_0 > 0 && d.total_0 < 10) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (150)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (160)
                } else {
                    return (170)
                }
            } if (d.total_0 > 10 && d.total_0 < 20) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (180)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (200)
                } else {
                    return (220)}
            } if (d.total_0 > 20 && d.total_0 < 50) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (225)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (250)
                } else {
                    return (275)}
            } if (d.total_0 > 50 && d.total_0 < 100) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (280)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (310)
                } else {
                    return (340)
                }
            } else {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (350)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (400)
                } else {
                    return (450)
                }
            }
        });

    var circle2 = svg.selectAll('.circle2')
        .data(data);

    circle2
        .enter()
        .append('circle')
        .attr("circle2");

    circle2
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.shia_0;
        })
        .attr("cx",250)
        .attr("fill","blue")
        .attr("cy", function(d){
            if (d.total_0 > 0 && d.total_0 < 10) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (150)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (160)
                } else {
                    return (170)
                }
            } if (d.total_0 > 10 && d.total_0 < 20) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (180)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (200)
                } else {
                    return (220)}
            } if (d.total_0 > 20 && d.total_0 < 50) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (225)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (250)
                } else {
                    return (275)}
            } if (d.total_0 > 50 && d.total_0 < 100) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (280)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (310)
                } else {
                    return (340)
                }
            } else {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (350)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (400)
                } else {
                    return (450)
                }
            }
        });

    var circle3 = svg.selectAll('.circle3')
        .data(data);

    circle3
        .enter()
        .append('circle')
        .attr("circle3");

    circle3
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.kurd_0;
        })
        .attr("cx",250)
        .attr("fill","red")
        .attr("cy", function(d){
            if (d.total_0 > 0 && d.total_0 < 10) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (150)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (160)
                } else {
                    return (170)
                }
            } if (d.total_0 > 10 && d.total_0 < 20) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (180)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (200)
                } else {
                    return (220)}
            } if (d.total_0 > 20 && d.total_0 < 50) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (225)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (250)
                } else {
                    return (275)}
            } if (d.total_0 > 50 && d.total_0 < 100) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (280)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (310)
                } else {
                    return (340)
                }
            } else {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (350)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (400)
                } else {
                    return (450)
                }
            }
        });

    var circle4 = svg.selectAll('.circle4')
        .data(data);

    circle4
        .enter()
        .append('circle')
        .attr("circle4");

    circle4
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.total_0;
        })
        .attr("cx",250)
        .attr("fill","grey")
        .attr("cy", 100);

    circle1.transition()
        .duration(1000);
    circle2.transition()
        .duration(1000);
    circle3.transition()
        .duration(1000);
    circle4.transition()
        .duration(1000);

    circle1.exit().remove();
    circle2.exit().remove();
    circle3.exit().remove();
    circle4.exit().remove();

    force
        .nodes(data)
        .start();
}