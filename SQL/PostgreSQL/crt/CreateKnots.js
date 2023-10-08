/*~
-- KNOTS --------------------------------------------------------------------------------------------------------------
--
-- Knots are used to store finite sets of values, normally used to describe states
-- of entities (through knotted attributes) or relationships (through knotted ties).
-- Knots have their own surrogate identities and are therefore immutable.
-- Values can be added to the set over time though.
-- Knots should have values that are mutually exclusive and exhaustive.
--
 ~*/
var knot;
while (knot = schema.nextKnot()) {
    if (knot.isGenerator())
        knot.identityGenerator = schema.metadata.identityProperty;
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "$knot.capsule"\."$knot.name" (
    "$knot.identityColumnName" $knot.identity $knot.identityGenerator not null,
    "$knot.valueColumnName" $knot.dataRange not null,
    $(knot.hasChecksum())? "$knot.checksumColumnName" bytea generated always as (cast(MD5(cast("$knot.valueColumnName" as text)) as bytea)) stored,
    $(schema.METADATA)? "$knot.metadataColumnName" $schema.metadata.metadataType not null,

    constraint "pk$knot.name" primary key (
        "$knot.identityColumnName"
    ),
    constraint "uq$knot.name" unique (
        $(knot.hasChecksum())? "$knot.checksumColumnName" : "$knot.valueColumnName"
    )
);

CREATE INDEX idx$knot.name ON "$knot.capsule"\."$knot.name" (
    "$knot.identityColumnName" asc
);
~*/
}