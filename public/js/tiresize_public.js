var tyres = [newTyre("tyre1"), newTyre("tyre2")];
function extraTyre() {
    var tyreName = "tyre" + (tyres.length + 1),
        tyre = newTyre(tyreName);
    tyres.push(tyre);
    _.bind(addTyre, null, $("#tyres"))(tyre);
}
$(function () {
    _.each(tyres, _.bind(addTyre, null, $("#tyres")));
});