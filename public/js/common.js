
function options(items, value){
    var template = "<% _.each(items, function(item){ %> <option value='<%= item %>' <%= (item == value)? 'selected=selected' : ''   %> > <%= item %> </option> <% }) %>";
    return _.template(template)({items: items, value: value});
}

function select(name){
    return _.template("<select class='tyre' id='<%= name %>' ></select>")({name: name});
}

function addTyre(div$, tyre, change) {
    var name = tyre.name;
    div$.append(
        select("tread_" + name) +
            select("profile_" + name) +
            select("rim_" + name) +
            "<span id='result_" + name + "' ></span><canvas id='tyre_canvas' height='400' width='400' ></canvas>"
    );
    var tread = $("#tread_" + name),
        profile = $("#profile_" + name),
        rim = $("#rim_" + name),
        result = $("#result_" + name);

    tread.html(options(treadOptions, tyre.tread));
    profile.html(options(profileOptions, tyre.profile));
    rim.html(options(rimOptions, tyre.rim));

    _.each([tread, profile, rim], function (select) {
        select.change(function(){
            var diameter = calc(),
                canvas = div$.find("#tyre_canvas")[0],
                context = canvas.getContext("2d");

            function  strokeCircle(centerX, centerY, radius){
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                context.stroke();
            }
            strokeCircle(200, 200, (diameter/20) );
        });

    });

    function calc() {
        var t = parseInt(tread.val()),
            p = parseInt(profile.val()),
            r = parseInt(rim.val()),
            diameter = tyreDiameter(t, p, r);
        result.html(" " + diameter.toFixed(2) + "mm or " + mmToInch(diameter).toFixed(2) + "\" diameter");
        if(_.isFunction(change)){
            change(diameter);  //event for observing
        }
        return diameter;
    }

    calc();
    return calc;
}

function newTyre(name) {
    return {name:name, tread:265, profile:75, rim:16};
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}