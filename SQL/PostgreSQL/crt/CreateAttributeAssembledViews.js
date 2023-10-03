/*~
-- ATTRIBUTE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------
--
-- The assembled view of an attribute combines the posit and annex table of the attribute.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        var attrDDL = attributeDDL(attribute, schemaMetadata);
/*~
-- Attribute assembled view -------------------------------------------------------------------------------------------
-- $attribute.name assembled view of the posit and annex tables,
-- pk$attribute.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW $capsuleNameQuoted\.$attrDDL.attributeNameQuoted AS
    SELECT
            $(schema.METADATA)? a.$attrDDL.attributeMetadataColumnNameQuoted,
            p.$attrDDL.attributeIdentityColumnNameQuoted,
            p.$attrDDL.attributeAnchorReferenceColumnNameQuoted,
            $(attribute.hasChecksum())? p.$attrDDL.attributeChecksumColumnNameQuoted,
            p.$attrDDL.attributeValueColumnNameQuoted,
            $(attribute.timeRange)? p.$attrDDL.attributeChangingColumnNameQuoted,
            a.$attrDDL.attributePositingColumnNameQuoted,
            a.$attrDDL.attributePositorColumnNameQuoted,
            a.$attrDDL.attributeReliabilityColumnNameQuoted,
            a.$attrDDL.attributeAssertionColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDL.attributePositNameQuoted p
        JOIN
            $capsuleNameQuoted\.$attrDDL.attributeAnnexNameQuoted a
        ON
            a.$attrDDL.attributeIdentityColumnNameQuoted = p.$attrDDL.attributeIdentityColumnNameQuoted;
        ');
~*/
    }
}