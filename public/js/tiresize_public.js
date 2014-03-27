var tyres = [newTyre("tyre1"), newTyre("tyre2")];

function extraTyre() {

    var sV = $("#vehicles").val(),
        vehicle = (sV && sV !== "") ? JSON.parse(sV) : undefined,
        tyreName = "tyre" + (tyres.length + 1),
        tyre = vehicle ? {rim:parseFloat(vehicle.wheels.rim),
            profile:parseFloat(vehicle.wheels.profile),
            tread:parseFloat(vehicle.wheels.tread),
            name:tyreName} :
            newTyre(tyreName);
    tyres.push(tyre);
    _.bind(addTyre, null, $("#tyres"))(tyre);
}
$(function () {
    _.each(tyres, _.bind(addTyre, null, $("#tyres")));
});

