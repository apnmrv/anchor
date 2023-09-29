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
    if (anchor.isGenerator())
        anchor.identityGenerator = schema.metadata.identityProperty;
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $anchor.capsule\.$anchor.name (
    $anchor.identityColumnName $anchor.identity $anchor.identityGenerator not null,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null, : $anchor.dummyColumnName boolean null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName
    )
);
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if (attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName bytea generated always as (cast(MD5(cast($attribute.valueColumnName as text)) as bytea)) stored,
    $attribute.changingColumnName $attribute.timeRange not null,

    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),

    constraint pk$attribute.positName primary key (
         $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    )
);
~*/
        } else if (attribute.isHistorized() && attribute.isKnotted()) {
            knot = attribute.knot;
            var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,

    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),

    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),

    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc,
        $attribute.knotReferenceName asc
    )
);
~*/
        } else if (attribute.isKnotted()) {
            knot = attribute.knot;
            var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,

    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),

    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),

    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),

    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName asc,
        $attribute.knotReferenceName asc
    )
);
~*/
        } else {
/*~
-- Static attribute posit table ---------------------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName bytea generated always as (cast(MD5(cast($attribute.valueColumnName as text)) as bytea)) stored,

    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),

    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),

    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName asc
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
);

~*/
}
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------

CREATE TABLE $attribute.capsule\.$attribute.annexName (
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.positorColumnName $schema.metadata.positorRange not null,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $attribute.assertionColumnName as cast(
        case
            when $attribute.reliabilityColumnName > $schema.metadata.deleteReliability then '+'
            when $attribute.reliabilityColumnName = $schema.metadata.deleteReliability then '?'
            when $attribute.reliabilityColumnName < $schema.metadata.deleteReliability then '-'
        end
    as char(1)) persisted,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references $attribute.capsule\.$attribute.positName($attribute.identityColumnName),
    constraint pk$attribute.annexName primary key (
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )
);

CREATE INDEX idx$attribute.annexName ON $attribute.capsule\.$attribute.annexName (
        $attribute.identityColumnName ASC,
        $attribute.positorColumnName ASC,
        $attribute.positingColumnName DESC
)
~*/
    }
}