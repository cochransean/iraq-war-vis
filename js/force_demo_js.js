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

    var gnodes = svg.selectAll('gnode')
        .data(data)
        .enter()
        .append('g')
        .classed('gnode', true)
        .call(force.drag);

    var node = gnodes.append("circle").attr("class", "node")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.sunni_0;
        })
        .attr("cx",250)
        .attr("fill","green")
        .attr("cy", function(d){
            if (d.total > 0 && d.total < 10) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 10)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 20)
                } else {
                    return (d.y + 30)
                }
            } if (d.total_0 > 10 && d.total_0 < 20) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 30)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 50)
                } else {
                    return (d.y + 75)}
            } if (d.total_0 > 20 && d.total_0 < 50) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 50)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 70)
                } else {
                    return (d.y + 100)}
            } if (d.total_0 > 50 && d.total_0 < 100) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 70)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 90)
                } else {
                    return (d.y + 120)
                }
            } if (d.total_0 > 100 && d.total_0 < 125) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 90)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 120)
                } else {
                    return (d.y + 150)
                }
            } if (d.total_0 > 125 && d.total_0 < 150) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 125)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 165)
                } else {
                    return (d.y + 200)
                }
            } if (d.total_0 > 150 && d.total_0 < 175) {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 165)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 190)
                } else {
                    return (d.y + 210)
                }
            } else {
                if (d.sunni_0 > d.shia_0 && d.sunni_0 > d.kurd_0) {
                    return (d.y + 200)
                }
                if (d.sunni_0 > d.shia_0 || d.sunni_0 > d.kurd_0) {
                    return (d.y + 225)
                } else {
                    return (d.y + 250)
                }
            }
        });

    var node1 = gnodes.append("circle").attr("class", "node1")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.shia_0;
        })
        .attr("fill","blue")
        .attr("cx",250)
        .attr("cy", function(d){
            if (d.total_0 > 0 && d.total_0 < 10) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 10)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 20)
                } else {
                    return (d.y + 30)
                }
            } if (d.total_0 > 10 && d.total_0 < 20) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 30)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 50)
                } else {
                    return (d.y + 75)}
            } if (d.total_0 > 20 && d.total_0 < 50) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 50)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 70)
                } else {
                    return (d.y + 100)}
            } if (d.total_0 > 50 && d.total_0 < 100) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 70)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 90)
                } else {
                    return (d.y + 120)
                }
            } if (d.total_0 > 100 && d.total_0 < 125) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 90)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 120)
                } else {
                    return (d.y + 150)
                }
            } if (d.total_0 > 125 && d.total_0 < 150) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 125)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 165)
                } else {
                    return (d.y + 200)
                }
            } if (d.total_0 > 150 && d.total_0 < 175) {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 165)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 190)
                } else {
                    return (d.y + 210)
                }
            } else {
                if (d.shia_0 > d.sunni_0 && d.shia_0 > d.kurd_0) {
                    return (d.y + 200)
                }
                if (d.shia_0 > d.sunni_0 || d.shia_0 > d.kurd_0) {
                    return (d.y + 225)
                } else {
                    return (d.y + 250)
                }
            }
        });

    var node2 = gnodes.append("circle").attr("class", "node2")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.kurd_0;
        })
        .attr("fill","red")
        .attr("cx", 250)
        .attr("cy", function(d){
            if (d.total_0 > 0 && d.total_0 < 10) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 10)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 20)
                } else {
                    return (d.y + 30)
                }
            } if (d.total_0 > 10 && d.total_0 < 20) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 30)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 50)
                } else {
                    return (d.y + 75)}
            } if (d.total_0 > 20 && d.total_0 < 50) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 50)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 70)
                } else {
                    return (d.y + 100)}
            } if (d.total_0 > 50 && d.total_0 < 100) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 70)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 90)
                } else {
                    return (d.y + 120)
                }
            } if (d.total_0 > 100 && d.total_0 < 125) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 90)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 120)
                } else {
                    return (d.y + 150)
                }
            } if (d.total_0 > 125 && d.total_0 < 150) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 125)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 165)
                } else {
                    return (d.y + 200)
                }
            } if (d.total_0 > 150 && d.total_0 < 175) {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.shia_0) {
                    return (d.y + 165)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 190)
                } else {
                    return (d.y + 210)
                }
            } else {
                if (d.kurd_0 > d.shia_0 && d.kurd_0 > d.sunni_0) {
                    return (d.y + 200)
                }
                if (d.kurd_0 > d.shia_0 || d.kurd_0 > d.sunni_0) {
                    return (d.y + 225)
                } else {
                    return (d.y + 250)
                }
            }
        });

    var node3 = gnodes.append("circle").attr("class", "node3")
        .filter(function(d){
            return d.district == district;
        })
        .attr('opacity',0.5)
        .attr("r",function(d) {
            return (d.total_0);
        })
        .attr("cx",250)
        .attr("cy", 100);

    node.transition()
        .duration(10000);
    node1.transition()
        .duration(10000);
    node2.transition()
        .duration(10000);
    node3.transition()
        .duration(10000);

    force
        .nodes(data)
        .start();
}