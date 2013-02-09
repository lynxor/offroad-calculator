$(function () {
    var economy$ = $("#economy"),
        capacity$ = $("#capacity"),
        desired_reach$ = $("#desired_reach"),
        fuel_price$ = $("#fuel_price"),
        max_reach$ = $("#max_reach"),
        petrol$ = $("#petrol"),
        diesel$ = $("#diesel"),
        vehicle$ = $("#vehicles"),
        expense$ = $("#expense"),
        trip_distance$ = $("#trip_distance");
    _.each([economy$, capacity$], function (inp$) {
        inp$.change(calculate_everything);
    });
    vehicle$.change(function () {
        var v = JSON.parse(vehicle$.val()),
            c = v.fuel.capacity,
            e = v.fuel.economy;
        economy$.val(e);
        capacity$.val(c);

        calculate_everything();
    });
    desired_reach$.change(calculate_additional_capacity);

    _.each([diesel$, petrol$], function (inp$) {
        inp$.change(function () {
            var value = (parseFloat(inp$.val()));
            if (_.isFinite(value)) {
                fuel_price$.val((parseFloat(inp$.val()) / 100).toFixed(2));
                calculate_everything();
            }
        });
    });

    fuel_price$.change(calculate_fuel_expense);
    trip_distance$.change(calculate_fuel_expense);

    function calculate_fuel_expense() {
        var e = parseFloat(economy$.val()),
            dist = parseFloat(trip_distance$.val()),
            p = parseFloat(fuel_price$.val()),
            liters = (dist / 100) * e,
            price = liters * p;

        expense$.html("R " + price.toFixed(2) + " (" + liters + " liters of fuel) @ " + e + "l/100km");
    }

    function calculate_reach() {
        var e = parseFloat(economy$.val()),
            c = parseFloat(capacity$.val()),
            answer = (100 / e) * c;

        max_reach$.html("Max reach is: " + answer.toFixed(2));
    }

    function calculate_additional_capacity() {
        var e = parseFloat(economy$.val()),
            d = parseFloat(desired_reach$.val()),
            c = parseFloat(capacity$.val()),
            ans = ((e / 100) * d) - c,
            jerry = Math.ceil(ans / 20);
        $("#additional_capacity").html("You'll need " + ans + "l of additional capacity (" + jerry + " jerry cans)");
    }

    function calculate_everything() {
        calculate_reach();
        calculate_additional_capacity();
        calculate_fuel_expense();
    }

    calculate_everything();

});