var vehicles = [];
$(function(){
    $("#add_vehicle").click(function(){
        var value = JSON.parse($("#vehicle_select").val()),
            column = vehicleColumn(value);
        $("#first_row").append(column);
    });
});

function vehicleColumn(vehicle){
    var dl = "<dl class='dl-horizontal'>",
        result = "<td><div class='vehicle_specs'>" + "<h4>Vehicle</h4>"+ dl +

        _.map(_.keys(vehicle), function(sectionKey){
        if(_.isObject(vehicle[sectionKey])){
            return "</dl><h4>" + capitalize(sectionKey) + "</h4>" + dl +
            _.map(_.keys(vehicle[sectionKey]), function(key){
                return generateDescription(key, vehicle[sectionKey][key]);
            }).join("") + "</dl>";
        } else {
            return generateDescription(sectionKey, vehicle[sectionKey]);
        }
    }).join("");

    function generateDescription(key, value){
        if(key === "_id"){
            return "";
        }
        return "<dt>"+ capitalize(key.replace(/_/g, " ")) + "</dt>" +
               "<dd>"+ value +"</dd>";
    }
    return result + "</dl></div></td>";
}