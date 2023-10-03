/*~
-- ATTRIBUTE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------
--
-- These table valued functions rewind an attribute posit table to the given
-- point in changing time, or an attribute annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time. The forwarder is the opposite of the rewinder, such that the 
-- union of the two will produce all rows in a posit table.
--
-- @positor             the view of which positor to adopt (defaults to 0)
-- @changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- @positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        var attrDDLs = attributeDDL(attribute, schemaMetadata);
        var attributeAnchorReferenceColumnDDL =
            toDdlExpr(attrDDL.attributeAnchorReferenceColumnNameQuoted, anchor.identity, notNullDDL);
        if(attribute.isHistorized()) {
/*~
-- Attribute posit rewinder -------------------------------------------------------------------------------------------
-- $attrDDLs.attributePositRewinderName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributePositRewinderNameQuoted (
    @changingTimepoint $attribute.timeRange = '$schema.EOT'::$attribute.timeRange
)
RETURNS TABLE (
            $attrDDLs.attributeIdentityColumnDDL,
            $attributeAnchorReferenceColumnDDL,
            $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnDDL,
            $attrDDLs.attributeValueColumnDDL,
            $attrDDLs.attributeChangingColumnDDL
)
AS \$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $attrDDLs.attributeIdentityColumnNameQuoted,
            $attrDDLs.attributeAnchorReferenceNameQuoted,
            $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnNameQuoted,
            $attrDDLs.attributeValueColumnNameQuoted,
            $attrDDLs.attributeChangingColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributePositNameQuoted
        WHERE
            $attrDDLs.attributeChangingColumnNameQuoted <= @changingTimepoint;
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute posit forwarder ------------------------------------------------------------------------------------------
-- $attrDDLs.attributePositForwarderName forwarding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributePositForwarderNameQuoted (
    @changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange
)
RETURNS TABLE (
    $attrDDLs.attributeIdentityColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnDDL,
    $attrDDLs.attributeValueColumnDDL,
    $attrDDLs.attributeChangingColumnDDL
)
AS \$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $attrDDLs.attributeIdentityColumnNameQuoted,
            $attrDDLs.attributeAnchorReferenceNameQuoted,
            $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnNameQuoted,
            $attrDDLs.attributeValueColumnNameQuoted,
            $attrDDLs.attributeChangingColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributePositNameQuoted
        WHERE
            $attrDDLs.attributeChangingColumnNameQuoted > @changingTimepoint;
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- $attrDDLs.attributeAnnexRewinderName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted (
    @positingTimepoint $schemaMetadata.positingRange = $schema.EOT::$schemaMetadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attrDDLs.attributeMetadataColumnDDL,
    $attrDDLs.attributeIdentityColumnDDL,
    $attrDDLs.attributePositingColumnDDL,
    $attrDDLs.attributePositorColumnDDL,
    $attrDDLs.attributeReliabilityColumnDDL,
    $attrDDLs.attributeAssertionColumnDDL
)
AS \$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $(schema.METADATA)? $attrDDLs.attributeMetadataColumnNameQuoted,
            $attrDDLs.attributeIdentityColumnNameQuoted,
            $attrDDLs.attributePositingColumnNameQuoted,
            $attrDDLs.attributePositorColumnNameQuoted,
            $attrDDLs.attributeReliabilityColumnNameQuoted,
            $attrDDLs.attributeAssertionColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributeAnnexNameQuoted
        WHERE
            $attrDDLs.attributePositingColumnNameQuoted <= @positingTimepoint;
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- $attrDDLs.attributeAssembledRewinderName rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributeAssembledRewinderNameQuoted (
    @positor $schemaMetadata.positorRange = 0,
    @changingTimepoint $attribute.timeRange = '$schema.EOT',
    @positingTimepoint $schemaMetadata.positingRange = '$schema.EOT'
)
RETURNS TABLE (
    $(schema.METADATA)? $attrDDLs.attributeMetadataColumnDDL,
    $attrDDLs.attributeIdentityColumnDDL,
    $attrDDLs.attributePositingColumnDDL,
    $attrDDLs.attributePositorColumnDDL,
    $attrDDLs.attributeReliabilityColumnDDL,
    $attrDDLs.attributeAssertionColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnNameQuoted,
    $attrDDLs.attributeValueColumnNameQuoted,
    $attrDDLs.attributeChangingColumnNameQuoted
)
AS \$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $(schema.METADATA)? a.$attrDDLs.attributeMetadataColumnNameQuoted,
            p.$attrDDLs.attributeIdentityColumnNameQuoted,
            a.$attrDDLs.attributePositingColumnNameQuoted,
            a.$attrDDLs.attributePositorColumnNameQuoted,
            a.$attrDDLs.attributeReliabilityColumnNameQuoted,
            a.$attrDDLs.attributeAssertionColumnNameQuoted,
            p.$attrDDLs.attributeAnchorReferenceColumnNameQuoted,
            $(attribute.hasChecksum())? p.$attrDDLs.attributeChecksumColumnNameQuoted,
            p.$attrDDLs.attributeValueColumnDDL,
            p.$attrDDLs.attributeChangingColumnDDL
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributePositRewinderNameQuoted (@changingTimepoint) p
        JOIN
            $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted (@positingTimepoint) a
        ON
            a.$attrDDLs.attributeIdentityColumnNameQuoted = p.$attrDDLs.attributeIdentityColumnNameQuoted
        AND
            a.$attrDDLs.attributePositorColumnNameQuoted = @positor
        AND
            a.$attrDDLs.attributePositingColumnNameQuoted = (
                SELECT TOP 1
                    sub.$attrDDLs.attributePositingColumnNameQuoted
                FROM
                    $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted(@positingTimepoint) sub
                WHERE
                    sub.$attrDDLs.attributeIdentityColumnNameQuoted = p.$attrDDLs.attributeIdentityColumnNameQuoted
                AND
                    sub.$attrDDLs.attributePositorColumnNameQuoted = @positor
                ORDER BY
                    sub.$attrDDLs.attributePositingColumnNameQuoted DESC
            );
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute assembled forwarder --------------------------------------------------------------------------------------
-- $attrDDLs.attributeAssembledForwarderName forwarding over changing and rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributeAssembledForwarderNameQuoted (
    @positor $schemaMetadata.positorRange = 0,
    @changingTimepoint $attribute.timeRange = '$schema.EOT',
    @positingTimepoint schemaMetadata.positingRange = '$schema.EOT'
)
RETURNS TABLE (
    $(schema.METADATA)? $attrDDLs.attributeMetadataColumnDDL,
    $attrDDLs.attributeIdentityColumnDDL,
    $attrDDLs.attributePositingColumnDDL,
    $attrDDLs.attributePositorColumnDDL,
    $attrDDLs.attributeReliabilityColumnDDL,
    $attrDDLs.attributeAssertionColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnDDL,
    $attrDDLs.attributeValueColumnDDL,
    $attrDDLs.attributeChangingColumnDDL
)
AS \$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $(schema.METADATA)? a.$attrDDLs.attributeMetadataColumnNameQuoted,
            p.$attrDDLs.attributeIdentityColumnNameQuoted,
            a.$attrDDLs.attributePositingColumnNameQuoted,
            a.$attrDDLs.attributePositorColumnNameQuoted,
            a.$attrDDLs.attributeReliabilityColumnNameQuoted,
            a.$attrDDLs.attributeAssertionColumnNameQuoted,
            p.$attrDDLs.attributeAnchorReferenceNameQuoted,
            $(attribute.hasChecksum())? p.$attrDDLs.attributeChecksumColumnNameQuoted,
            p.$attrDDLs.attributeValueColumnNameQuoted,
            p.$attrDDLs.attributeChangingColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributePositForwarderNameQuoted(@changingTimepoint) p
        JOIN
            $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted(@positingTimepoint) a
        ON
            a.$attrDDLs.attributeIdentityColumnNameQuoted = p.$attrDDLs.attributeIdentityColumnNameQuoted
        AND
            a.$attrDDLs.attributePositorColumnNameQuoted = @positor
        AND
            a.$attrDDLs.attributePositingColumnNameQuoted = (
                WITH sub AS ($capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted(@positingTimepoint))
                SELECT TOP 1
                    sub.$attrDDLs.attributePositingColumnNameQuoted
                FROM sub
                WHERE
                    sub.$attrDDLs.attributeIdentityColumnNameQuoted = p.$attrDDLs.attributeIdentityColumnNameQuoted
                AND
                    sub.$attrDDLs.attributePositorColumnNameQuoted = @positor
                ORDER BY
                    sub.$attrDDLs.attributePositingColumnNameQuoted DESC
            );
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute previous value -------------------------------------------------------------------------------------------
-- $attrDDLs.attributePreviousName function for getting previous value
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributePreviousNameQuoted (
    @id $anchor.identity,
    @positor $schemaMetadata.positorRange = 0,
    @changingTimepoint $attribute.timeRange = '$schema.EOT',
    @positingTimepoint $schemaMetadata.positingRange = '$schema.EOT'
)
RETURNS $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
AS \$$function\$$
BEGIN
    RETURN QUERY
        SELECT TOP 1
            $(attribute.hasChecksum())? pre.$attrDDLs.attributeChecksumColumnNameQuoted : pre.$attrDDLs.attributeValueColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributeRewinderNameQuoted (
                @positor,
                @changingTimepoint,
                @positingTimepoint
            ) pre
        WHERE
            pre.$attrDDLs.attributeAnchorReferenceNameQuoted = @id
        AND
            pre.$attrDDLs.attributeChangingColumnNameQuoted < @changingTimepoint
        AND
            pre.$attrDDLs.attributeAssertionColumnNameQuoted = isnull(@assertion, pre.$attrDDLs.attributeAssertionColumnNameQuoted)
        ORDER BY
            pre.$attrDDLs.attributeChangingColumnNameQuoted DESC,
            pre.$attrDDLs.attributePositingColumnNameQuoted DESC;
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute following value ------------------------------------------------------------------------------------------
-- $attrDDLs.attributeFollowingName function for getting following value
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributeFollowingNameQuoted (
    @id $anchor.identity,
    @positor $schemaMetadata.positorRange = 0,
    @changingTimepoint $attribute.timeRange = '$schema.EOT',
    @positingTimepoint $schemaMetadata.positingRange = '$schema.EOT'
)
RETURNS $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
AS
\$$function\$$
BEGIN
    RETURN QUERY
        SELECT TOP 1
            $(attribute.hasChecksum())? fol.$attrDDLs.attributeChecksumColumnNameQuoted : fol.$attrDDLs.attributeValueColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributeForwarderNameQuoted (
                @positor,
                @changingTimepoint,
                @positingTimepoint
            ) fol
        WHERE
            fol.$attrDDLs.attributeAnchorReferenceNameQuoted = @id
        AND
            fol.$attrDDLs.attributeChangingColumnNameQuoted > @changingTimepoint
        AND
            fol.$attrDDLs.attributeAssertionColumnNameQuoted = isnull(@assertion, fol.$attrDDLs.attributeAssertionColumnNameQuoted)
        ORDER BY
            fol.$attrDDLs.attributeChangingColumnNameQuoted ASC,
            fol.$attrDDLs.attributePositingColumnNameQuoted DESC;
END
\$$function\$$
LANGUAGE plpgsql;
~*/
        } else {
/*~
-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- $attrDDLs.attributeAnnexRewinderName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted (
    @positingTimepoint $schemaMetadata.positingRange = '$schema.EOT'
)
RETURNS TABLE (
        $(schema.METADATA)? $attrDDLs.attributeMetadataColumnDDL,
        $attrDDLs.attributeIdentityColumnDDL,
        $attrDDLs.attributePositingColumnDDL,
        $attrDDLs.attributePositorColumnDDL,
        $attrDDLs.attributeReliabilityColumnDDL,
        $attrDDLs.attributeAssertionColumnDDL
)
AS
\$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $(schema.METADATA)? $attrDDLs.attributeMetadataColumnNameQuoted,
            $attrDDLs.attributeIdentityColumnNameQuoted,
            $attrDDLs.attributePositingColumnNameQuoted,
            $attrDDLs.attributePositorColumnNameQuoted,
            $attrDDLs.attributeReliabilityColumnNameQuoted,
            $attrDDLs.attributeAssertionColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributeAnnexNameQuoted
        WHERE
            $attrDDLs.attributePositingColumnNameQuoted <= @positingTimepoint;
END;
\$$function\$$
LANGUAGE plpgsql;

-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- $attrDDLs.attributeAssembledRewinderName rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION $capsuleNameQuoted\.$attrDDLs.attributeAssembledRewinderNameQuoted (
    @positor $schemaMetadata.positorRange = 0,
    @positingTimepoint $schemaMetadata.positingRange = $schema.EOT::$schemaMetadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attrDDLs.attributeMetadataColumnDDL,
    $attrDDLs.attributeIdentityColumnDDL,
    $attrDDLs.attributePositingColumnDDL,
    $attrDDLs.attributePositorColumnDDL,
    $attrDDLs.attributeReliabilityColumnDDL,
    $attrDDLs.attributeAssertionColumnDDL,
    $attributeAnchorReferenceColumnDDL,
    $(attribute.hasChecksum())? $attrDDLs.attributeChecksumColumnDDL,
    $attrDDLs.attributeValueColumnDDL
)
AS
\$$function\$$
BEGIN
    RETURN QUERY
        SELECT
            $(schema.METADATA)? a.$attrDDLs.attributeMetadataColumnNameQuoted,
            p.$attrDDLs.attributeIdentityColumnNameQuoted,
            a.$attrDDLs.attributePositingColumnNameQuoted,
            a.$attrDDLs.attributePositorColumnNameQuoted,
            a.$attrDDLs.attributeReliabilityColumnNameQuoted,
            a.$attrDDLs.attributeAssertionColumnNameQuoted,
            p.$attrDDLs.attributeAnchorReferenceNameQuoted,
            $(attribute.hasChecksum())? p.$attrDDLs.attributeChecksumColumnNameQuoted,
            p.$attrDDLs.attributeValueColumnNameQuoted
        FROM
            $capsuleNameQuoted\.$attrDDLs.attributePositNameQuoted p
        JOIN
            $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted(@positingTimepoint) a
        ON
            a.$attrDDLs.attributeIdentityColumnNameQuoted = p.$attrDDLs.attributeIdentityColumnNameQuoted
        AND
            a.$attrDDLs.attributePositorColumnNameQuoted = @positor
        AND
            a.$attrDDLs.attributePositingColumnNameQuoted = (
                SELECT TOP 1
                    sub.$attrDDLs.attributePositingColumnNameQuoted
                FROM
                    $capsuleNameQuoted\.$attrDDLs.attributeAnnexRewinderNameQuoted(@positingTimepoint) sub
                WHERE
                    sub.$attrDDLs.attributeIdentityColumnNameQuoted = p.$attrDDLs.attributeIdentityColumnNameQuoted
                AND
                    sub.$attrDDLs.attributePositorColumnNameQuoted = @positor
                ORDER BY
                    sub.$attrDDLs.attributePositingColumnNameQuoted DESC
            );
END;
\$$function\$$
LANGUAGE plpgsql;
~*/
        }
    }
}
