function quoted(s) {
    return "\"" + s + "\"";
}

function toDdlExpr(...s) {
    return s.join(" ")
}

var schemaMetadata = schema.metadata;
var capsuleName = schemaMetadata.encapsulation;
var capsuleNameQuoted = quoted(capsuleName);
var notNullDDL = "not null";