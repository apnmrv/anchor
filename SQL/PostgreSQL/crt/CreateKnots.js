/*~
-- KNOTS --------------------------------------------------------------------------------------------------------------
--
-- Knots are used to store finite sets of values, normally used to describe states
-- of entities (through knotted attributes) or relationships (through knotted ties).
-- Knots have their own surrogate identities and are therefore immutable.
-- Values can be added to the set over time though.
-- Knots should have values that are mutually exclusive and exhaustive.
-- Knots are unfolded when using equivalence.
--
 ~*/
var knot;
while (knot = schema.nextKnot()) {
    var knotNameQuoted = quoted(knot.name);
    var knotIdentityColumnNameQuoted = quoted(knot.identityColumnName);
    var knotMetadataColumnNameQuoted = quoted(knot.metadataColumnName);
    var knotValueColumnNameQuoted = quoted(knot.valueColumnName);
    var knotChecksumColumnNameQuoted = quoted(knot.checksumColumnName);

    var knotIdentityColumnDDL = toDdlExpr(
        knotIdentityColumnNameQuoted,
        knot.identity,
        knot.identityGenerator,
        notNullDDL
    );
    var knotMetadataColumnDDL = toDdlExpr(
        knotMetadataColumnNameQuoted,
        schemaMetadata.metadataType,
        notNullDDL
    );
    var knotValueColumnDDL = toDdlExpr(
        knotValueColumnNameQuoted,
        knot.dataRange,
        notNullDDL
    );

    var knotChecksumColumnDDL = toDdlExpr(
        knotChecksumColumnNameQuoted,
        "bytea generated always as (cast(MD5(cast(" + knot.valueColumnName + "as text)) as bytea))",
        "stored"
    );

    var pkKnotQuoted = quoted("pk" + knot.name);
    var uqKnotQuoted = quoted("uq" + knot.name);
    var idxKnotQuoted = quoted("idx" + knot.name);

    if (knot.isGenerator())
        knot.identityGenerator = schemaMetadata.identityProperty;
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$knotNameQuoted (
    $knotIdentityColumnDDL,
    $knotValueColumnDDL,
    $(knot.hasChecksum())? $knotChecksumColumnDDL,
    $(schema.METADATA)? $knotMetadataColumnDDL,

    constraint $pkKnotQuoted primary key (
        $knotIdentityColumnNameQuoted
    ),

    constraint $uqKnotQuoted unique (
        $(knot.hasChecksum())? $knotChecksumColumnNameQuoted : $knotValueColumnNameQuoted
    )
);

CREATE INDEX $idxKnotQuoted ON $capsuleNameQuoted\.$knotNameQuoted (
    $knotIdentityColumnNameQuoted asc
);
~*/
}