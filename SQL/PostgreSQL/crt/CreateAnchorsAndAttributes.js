/*~
-- ANCHORS AND ATTRIBUTES ---------------------------------------------------------------------------------------------
--
-- Anchors are used to store the identities of entities.
-- Anchors are immutable.
-- Attributes are used to store values for properties of entities.
-- Attributes are mutable, their values may change over one or more types of time.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
-- Anchors may have zero or more adjoined attributes.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.isGenerator())
        anchor.identityGenerator = schema.metadata.identityProperty;
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "$anchor.capsule"\."$anchor.name" (
    "$anchor.identityColumnName" $anchor.identity $anchor.identityGenerator not null,
    $(schema.METADATA)? "$anchor.metadataColumnName" $schema.metadata.metadataType not null, : "$anchor.dummyColumnName" bit null,
    constraint "pk$anchor.name" primary key (
        "$anchor.identityColumnName"
    )
);

CREATE INDEX "idx$anchor.name" ON "$anchor.capsule"\."$anchor.name" (
    "$anchor.identityColumnName" asc
);
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isGenerator())
            attribute.identityGenerator = schema.metadata.identityProperty;
        if (attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" $attribute.identity $attribute.identityGenerator not null,
    "$attribute.anchorReferenceName" $anchor.identity not null,
    "$attribute.valueColumnName" $attribute.dataRange not null,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea generated always as (cast(MD5(cast("$attribute.valueColumnName" as text)) as bytea)) stored,
    "$attribute.changingColumnName" $attribute.timeRange not null,

    constraint "fk$attribute.positName" foreign key (
        "$attribute.anchorReferenceName"
    ) references "$anchor.capsule"\."$anchor.name"("$anchor.identityColumnName"),

    constraint "pk$attribute.positName" primary key (
        "$attribute.identityColumnName"
    ),
    constraint "uq$attribute.positName" unique (
        "$attribute.anchorReferenceName",
        "$attribute.changingColumnName",
        $(attribute.hasChecksum())? "$attribute.checksumColumnName": "$attribute.valueColumnName"
    )
);

CREATE INDEX "idxPk$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" asc
);

CREATE INDEX "idxUq$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.anchorReferenceName" asc,
    "$attribute.changingColumnName" desc,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" asc : "$attribute.valueColumnName" asc
);

ALTER TABLE IF EXISTS ONLY "$attribute.capsule"\."$attribute.positName" CLUSTER ON "idxUq$attribute.positName";
~*/
        } else if (attribute.isHistorized() && attribute.isKnotted()) {
            knot = attribute.knot;
/*~
-- Knotted historized attribute posit table ---------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" $attribute.identity $attribute.identityGenerator not null,
    "$attribute.anchorReferenceName" $anchor.identity not null,
    "$attribute.knotReferenceName" $knot.identity not null,
    "$attribute.changingColumnName" $attribute.timeRange not null,

    constraint "fk_A_$attribute.positName" foreign key (
        "$attribute.anchorReferenceName"
    ) references "$anchor.capsule"\."$anchor.name"("$anchor.identityColumnName"),
    constraint "fk_K_$attribute.positName" foreign key (
        "$attribute.knotReferenceName"
    ) references "$knot.capsule"\."$knot.name"("$knot.identityColumnName"),
    constraint "pk$attribute.positName" primary key (
        "$attribute.identityColumnName"
    ),
    constraint "uq$attribute.positName" unique (
        "$attribute.anchorReferenceName",
        "$attribute.changingColumnName",
        "$attribute.knotReferenceName"
    )
);
CREATE INDEX "idxPk$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" asc
);

CREATE INDEX "idxUq$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.anchorReferenceName" asc,
    "$attribute.changingColumnName" desc,
    "$attribute.knotReferenceName" asc
);

ALTER TABLE IF EXISTS ONLY "$attribute.capsule"\."$attribute.positName" CLUSTER ON "idxUq$attribute.positName";

~*/
        } else if (attribute.isKnotted()) {
            knot = attribute.knot;
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" $attribute.identity $attribute.identityGenerator not null,
    "$attribute.anchorReferenceName" $anchor.identity not null,
    "$attribute.knotReferenceName" $knot.identity not null,
    constraint "fk_A_$attribute.positName" foreign key (
        "$attribute.anchorReferenceName"
    ) references "$anchor.capsule"\."$anchor.name"("$anchor.identityColumnName"),
    constraint "fk_K_$attribute.positName" foreign key (
        "$attribute.knotReferenceName"
    ) references "$knot.capsule"\."$knot.name"("$knot.identityColumnName"),
    constraint "pk$attribute.positName" primary key (
        "$attribute.identityColumnName"
    ),
    constraint "uq$attribute.positName" unique (
        "$attribute.anchorReferenceName",
        "$attribute.knotReferenceName"
    )
);
CREATE INDEX "idxPk$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" asc
);

CREATE INDEX "idxUq$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.anchorReferenceName" asc,
    "$attribute.knotReferenceName" asc
);

ALTER TABLE IF EXISTS ONLY  "$attribute.capsule"\."$attribute.positName" CLUSTER ON "idxUq$attribute.positName";
~*/
        } else {
/*~
-- Static attribute posit table ---------------------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName" $attribute.identity $attribute.identityGenerator not null,
    "$attribute.anchorReferenceName" $anchor.identity not null,
    "$attribute.valueColumnName" $attribute.dataRange not null,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea generated always as (cast(MD5(cast("$attribute.valueColumnName" as text)) as bytea)) stored,
    constraint "fk$attribute.positName" foreign key (
        "$attribute.anchorReferenceName"
    ) references "$anchor.capsule"\."$anchor.name"("$anchor.identityColumnName"),
    constraint "pk$attribute.positName" primary key (
        "$attribute.identityColumnName"
    ),
    constraint "uq$attribute.positName" unique (
        "$attribute.anchorReferenceName",
        $(attribute.hasChecksum())? "$attribute.checksumColumnName" : "$attribute.valueColumnName"
    )
);

CREATE INDEX "idxPk$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.identityColumnName"
);

CREATE INDEX "idxUq$attribute.positName" ON "$attribute.capsule"\."$attribute.positName" (
    "$attribute.anchorReferenceName" asc,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" asc : "$attribute.valueColumnName" asc
);

ALTER TABLE IF EXISTS ONLY "$attribute.capsule"\."$attribute.positName" CLUSTER ON "idxUq$attribute.positName";

~*/
        }
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------

CREATE TABLE "$attribute.capsule"\."$attribute.annexName" (
    "$attribute.identityColumnName" $attribute.identity not null,
    "$attribute.positingColumnName" $schema.metadata.positingRange not null,
    "$attribute.positorColumnName" $schema.metadata.positorRange not null,
    "$attribute.reliabilityColumnName" $schema.metadata.reliabilityRange not null,
    "$attribute.assertionColumnName" char(1) generated always as (
        case
            when "$attribute.reliabilityColumnName" > $schema.metadata.deleteReliability then '+'
            when "$attribute.reliabilityColumnName" = $schema.metadata.deleteReliability then '?'
            when "$attribute.reliabilityColumnName" < $schema.metadata.deleteReliability then '-'
        end) stored,
    $(schema.METADATA)? "$attribute.metadataColumnName" $schema.metadata.metadataType not null,
    constraint "fk$attribute.annexName" foreign key (
        "$attribute.identityColumnName"
    ) references "$attribute.capsule"\."$attribute.positName"("$attribute.identityColumnName"),
    constraint "pk$attribute.annexName" primary key (
        "$attribute.identityColumnName",
        "$attribute.positorColumnName",
        "$attribute.positingColumnName"
    )
);
CREATE INDEX "idxPk$attribute.annexName" ON "$attribute.capsule"\."$attribute.annexName" (
    "$attribute.identityColumnName" asc,
    "$attribute.positorColumnName" asc,
    "$attribute.positingColumnName" desc
);

ALTER TABLE IF EXISTS ONLY  "$attribute.capsule"\."$attribute.annexName" CLUSTER ON "idxPk$attribute.annexName";
~*/
    }
}