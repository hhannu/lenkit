window.onload = function(event) {
    
    //console.log('showMap', points);

    if(points.length > 0) {

        var trackCoordinates = [];
        var bounds = new google.maps.LatLngBounds();

        // get all trackpoints 
        for(i = 0; i < points.length; i++) {
            var trackPoint = new google.maps.LatLng(points[i].lat, points[i].lon);
            trackCoordinates.push(trackPoint);
            bounds.extend(trackPoint);
        }

        // options for map
        var mapOptions = {
            zoom: 0,
            center: bounds.getCenter(),
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            streetViewControl: false,
            noClear: false
        };

        // the map
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // line to be drawn on map
        var route = new google.maps.Polyline({
            path: trackCoordinates,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        // draw route, center map and adjust zoom
        route.setMap(map);
        map.fitBounds(bounds);

        // marker for start position
        var startM = new google.maps.Marker({
            position: trackCoordinates[0],
            title: "Start",
            map: map
        });

        // marker for end position
        var stopM = new google.maps.Marker({
            position: trackCoordinates[trackCoordinates.length - 1],
            title: "Stop",
            map: map
        });
    }
    else{
        console.log('No track to display');   
    }
}