function toFixedDown(value, digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = value.toString().match(re);
    return m ? parseFloat(m[1]) : value.valueOf();
};
var info = undefined;
var legend = undefined;
var leaflet_map = (function (d3, L) {
    'use strict';

    var _self = {};

    _self.loadMap = function (graph_id, leaflet_url, properties) {
        var map = L.map("mapid_" + graph_id, {
        });

        d3.dsv(";", leaflet_url, function(d){
			return {
				year: parseInt(d.year), // convert "Year" column to Date
				country: d.country,
				density: parseFloat(d.density)
			  };
		}).then(function (data) {
			
			var selected_year = undefined;
			
			var years = [];
			for (var i in data){
				if($.inArray(data[i]['year'], years) < 0) {
					if (data[i]['year']){
						years.push(data[i]['year']);
					}
				} 
			}	
			
			if ($('#select_year').length == 0){
				var sel = $('<select id="select_year">').appendTo('#filters');
				$(years).each(function() {
					sel.append($("<option>").attr('value',this).text(this));
				});
				selected_year = years[years.length-1];
				$("#select_year option:last").attr("selected", "selected");
				
				$(document).on('change', '#select_year', function(){
					selected_year = parseInt($(this).val());
					update_countries(selected_year);
				});
			}
			update_countries(selected_year);
			
			function update_countries(){
				var data_array = [];
				
				for (var k in countries['features']){
					var c = countries['features'][k];
					c['properties']['density'] = undefined;
					for (var i in data){
						if (c['id'] == data[i]['country'] && data[i]['year'] == selected_year){
							c['properties']['density'] = data[i]['density'];
							data_array.push(c['properties']['density']);
						}
					}
				}
			
				var min = d3.min(data_array, function(d) { return d; });
				var max = d3.max(data_array, function(d) { return d; });

				var mincolor = properties.mincolor;
				var maxcolor = properties.maxcolor;

				var infotitle = properties.infotitle;
				var infodescription = properties.infodescription;

				var fractions = properties.fractions;

				var mapUrl = properties.mapurl;
				var scale = L.scaleColor(min, max, { colorArray: [mincolor, maxcolor] });

				map.eachLayer(function (layer) {
					map.removeLayer(layer);
				});

				if (info){
					map.removeControl(info);
				}
				if (legend){
					map.removeControl(legend);
				}

				info = _self.addInfo(map, infotitle, infodescription);
				legend = _self.addLegend(map, scale, fractions, max, min);
				_self.addMap(map, mapUrl, scale, info);

				
			}
        });
      
    };

    _self.addMap = function (rootMap, mapUrl, scale, info) {
        L.tileLayer(mapUrl, { attribution: '' }).addTo(rootMap);
		
        _self.geojson = L.geoJson(countries, {
            style: function (feature) {
                return {
                    fillColor: scale.getColor(feature.properties.density),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function (feature, layer) {
                layer.on({
                    mouseover: function (e) {
                        var layer = e.target;

                        layer.setStyle({
                            weight: 5,
                            color: '#666',
                            dashArray: '',
                            fillOpacity: 0.7
                        });

                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }

                        if (info) {
                            info.update(layer.feature.properties);
                        }
                    },
                    mouseout: function (e) {
                        _self.geojson.resetStyle(e.target);
                        if (info) {
                            info.update();
                        }
                    },
                    click: function (e) {
                        rootMap.fitBounds(e.target.getBounds());
                    }
                });
            }
        }).addTo(rootMap);
        //rootMap.setView([30, 12], 0);
		
		if(_self.geojson.getLayers() && _self.geojson.getLayers().length > 1) {
			rootMap.fitBounds(_self.geojson.getBounds());
		}
		else {
			rootMap.setZoom(2);
		}
    };

    _self.addInfo = function (rootMap, title, description) {
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        info.update = function (props) {
            title = title || "";
            description = description || "";

            this._div.innerHTML = (title ? '<h4>' + title + '</h4>' : '') + (props ?
                (props.name ? '<b>' + props.name + '</b><br />' : '') + props.density + ' ' + description
                : 'Hover over a state');
        };

        info.addTo(rootMap);

        return info;
    };

    _self.addLegend = function (rootMap, scale, fractions, max, min) {
        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = function (map) {
            var f = d3.format(".2s");
            var div = L.DomUtil.create('div', 'info legend');
            var grades = [];
            var labels = [];
            var range  = (max-min)/fractions;        // Difference between min and max
            for(var i = 0; i < fractions; i++){
                grades[i] = toFixedDown(min + range * (i), 0);
               
            }
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                if (grades[i+1]) {
                    div.innerHTML +=
                        '<div class="leaflet_map_legend"><i style="background:' + scale.getColor(grades[i] + 1) + '"></i> ' +
                        f(grades[i]) + ( f(grades[i + 1]) ? ' &ndash; ' + f(grades[i + 1]) + '</div>' : '+');
                }
                else {
                    div.innerHTML +=
                        '<div class="leaflet_map_legend"><i style="background:' + scale.getColor(grades[i] + 1) + '"></i> ' +
                        f(grades[i]) + '+</div>';
                }
            }

            return div;
        };
        legend.addTo(rootMap);
		return legend;
    };

    return {
        loadMap: _self.loadMap
    };

})(d3, L);