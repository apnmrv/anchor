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
    var anchorDDLs = anchorDDL(anchor, schemaMetadata)
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchorDDLs.anchorName table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$anchorDDLs.anchorNameQuoted (
    $anchorDDLs.anchorIdentityColumnDDL,
    $(schema.METADATA)? $anchorDDLs.anchorMetadataColumnDDL, : $anchorDDLs.anchorDummyColumnDDL,
    constraint $anchorDDLs.pkAnchorNameQuoted primary key (
        $anchorDDLs.anchorIdentityColumnNameQuoted
    )
);
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        var attrDDL = attributeDDL(attribute, schemaMetadata);
        var attributeAnchorReferenceColumnDDL =
            toDdlExpr(attrDDL.attributeAnchorReferenceColumnNameQuoted, anchor.identity, notNullDDL);
        if (attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchorDDLs.anchorName)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$attrDDL.attributePositNameQuoted (
    $attrDDL.attributeIdentityColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $attrDDL.attributeValueColumnDDL,
    $(attribute.hasChecksum())? attrDDL.attributeChecksumColumnDDL,
    $attrDDL.attributeChangingColumnDDL,

    constraint $attrDDL.fkAttributePositNameQuoted foreign key (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted
    ) references $capsuleNameQuoted\.$anchorDDLs.anchorNameQuoted ($attrDDL.anchorIdentityColumnNameQuoted),

    constraint $attrDDL.pkAttributePositNameQuoted primary key (
         $attrDDL.anchorIdentityColumnNameQuoted
    ),
    constraint $attrDDL.uqAttributePositName unique (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted asc,
        $attrDDL.attributeChangingColumnNameQuoted desc,
        $(attribute.hasChecksum())? $attrDDL.attributeChecksumColumnNameQuoted : $attrDDL.attributeValueColumnNameQuoted
    )
);
~*/
        } else if (attribute.isHistorized() && attribute.isKnotted()) {
            knot = attribute.knot;
            var knotTableName = quoted(knot.isEquivalent() ? knot.identityName : knot.name);
            var knotIdentityColumnName = quoted(knot.identityColumnName);
            var attributeKnotReferenceColumnDDL = toDdlExpr(
                attrDDL.attributeKnotReferenceColumnNameQuoted,
                knot.identity,
                notNullDDL
            );
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchorDDLs.anchorName)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$attrDDL.attributePositNameQuoted (
    $attrDDL.attributeIdentityColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $attributeKnotReferenceColumnDDL,
    $attrDDL.attributeChangingColumnDDL,

    constraint $attrDDL.fkAnchorAttributePositNameQuoted foreign key (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted
    ) references $capsuleNameQuoted\.$anchorDDLs.anchorNameQuoted ($anchorIdentityColumnNameQuoted),

    constraint $attrDDL.fkKnotAttributePositNameQuoted foreign key (
        $attrDDL.attributeKnotReferenceColumnNameQuoted
    ) references $capsuleNameQuoted\.$knotTableName ($knotIdentityColumnName),

    constraint $attrDDL.pkAttributePositNameQuoted primary key (
        $attrDDL.attributeIdentityColumnNameQuoted
    ),

    constraint $attrDDL.uqAttributePositNameQuoted unique (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted asc,
        $attrDDL.attributeChangingColumnNameQuoted desc,
        $attrDDL.attributeKnotReferenceColumnNameQuoted asc
    )
);
~*/
        } else if (attribute.isKnotted()) {
            knot = attribute.knot;
            knotTableName = quoted(knot.isEquivalent() ? knot.identityName : knot.name);
            knotIdentityColumnName = quoted(knot.identityColumnName);
            attributeKnotReferenceColumnDDL = toDdlExpr(
                attrDDL.attributeKnotReferenceColumnNameQuoted,
                knot.identity,
                notNullDDL
            );
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------------
-- $attrDDL.attributePositName table (on $anchorDDLs.anchorName)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$attrDDL.attributePositNameQuoted (
    $attrDDL.attributeIdentityColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $attributeKnotReferenceColumnDDL,

    constraint $attrDDL.fkAnchorAttributePositNameQuoted foreign key (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted
    ) references $capsuleNameQuoted\.$anchorDDLs.anchorNameQuoted ($anchorDDLs.anchorIdentityColumnNameQuoted),

    constraint $attrDDL.fkKnotAttributePositNameQuoted foreign key (
        $attrDDL.attributeKnotReferenceColumnNameQuoted
    ) references $capsuleNameQuoted\.$knotTableName ($knotIdentityColumnName),

    constraint $attrDDL.pkAttributePositNameQuoted primary key (
        $attrDDL.attributeIdentityColumnNameQuoted
    ),

    constraint $attrDDL.uqAttributePositNameQuoted unique (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted asc,
        $attrDDL.attributeKnotReferenceColumnNameQuoted asc
    )
);
~*/
        } else {
/*~
-- Static attribute posit table ---------------------------------------------------------------------------------------------
-- $attrDDL.attributePositName table (on $anchorDDLs.anchorName)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$attrDDL.attributePositNameQuoted (
    $attrDDL.attributeIdentityColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $attrDDL.attributeValueColumnDDL,
    $(attribute.hasChecksum())? $attrDDL.attributeChecksumColumnDDL,

    constraint $attrDDL.fkAttributeNameQuoted foreign key (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted
    ) references $capsuleNameQuoted\.$anchorDDLs.anchorNameQuoted ($anchorDDLs.anchorIdentityColumnNameQuoted),

    constraint $attrDDL.pkAttributePositNameQuoted primary key (
        $attrDDL.attributeIdentityColumnNameQuoted
    ),

    constraint $attrDDL.uqAttributePositNameQuoted unique (
        $attrDDL.attributeAnchorReferenceColumnNameQuoted asc
        $(attribute.hasChecksum())? $attrDDL.attributeChecksumColumnNameQuoted asc : $attrDDL.attributeValueColumnNameQuoted asc
    )
);

~*/
        }
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attrDDL.attributeAnnexName table (of $attrDDL.attributePositName on $anchorDDLs.anchorName)
-----------------------------------------------------------------------------------------------------------------------

CREATE TABLE $capsuleNameQuoted\.$attrDDL.attributeAnnexNameQuoted (
    $attrDDL.attributeIdentityColumnDDL,
    $attrDDL.attributePositingColumnDDL,
    $attrDDL.attributePositorColumnDDL,
    $attrDDL.attributeReliabilityColumnDDL,
    $attrDDL.attributeAssertionColumnNameQuoted char(1) generated always as (
        case
            when $attrDDL.attributeReliabilityColumnNameQuoted > $schemaMetadata.deleteReliability then '+'
            when $attrDDL.attributeReliabilityColumnNameQuoted = $schemaMetadata.deleteReliability then '?'
            when $attrDDL.attributeReliabilityColumnNameQuoted < $schemaMetadata.deleteReliability then '-'
        end) stored,
    $(schema.METADATA)? $attrDDL.attributeMetadataColumnDDL,

    constraint $attrDDL.fkAttributeAnnexNameQuoted foreign key (
        $attrDDL.attributeIdentityColumnNameQuoted
    ) references $capsuleNameQuoted\.$attrDDL.attributePositNameQuoted($attrDDL.attributeIdentityColumnNameQuoted),
    constraint $attrDDL.pkAttributeAnnexNameQuoted primary key (
        $attrDDL.attributeIdentityColumnNameQuoted,
        $attrDDL.attributePositorColumnNameQuoted,
        $attrDDL.attributePositingColumnNameQuoted
    )
);

CREATE INDEX $attrDDL.idxAttributeAnnexNameQuoted ON $capsuleNameQuoted\.$attrDDL.attributeAnnexNameQuoted (
        $attrDDL.attributeIdentityColumnNameQuoted asc,
        $attrDDL.attributePositorColumnNameQuoted asc,
        $attrDDL.attributePositingColumnNameQuoted desc
);
~*/
    }
}