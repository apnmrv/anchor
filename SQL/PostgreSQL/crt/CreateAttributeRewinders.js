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
-- positor             the view of which positor to adopt (defaults to 0)
-- changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute, returnType;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized()) {
            returnType = attribute.isKnotted() ? attribute.knot.identity : (attribute.hasChecksum() ? 'bytea' : attribute.dataRange);
/*~
-- Attribute posit rewinder -------------------------------------------------------------------------------------------
-- r$attribute.positName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."r$attribute.positName" (
    changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange
)
RETURNS TABLE (
            "$attribute.identityColumnName" $attribute.identity,
            "$attribute.anchorReferenceName" $anchor.identity,
            $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea,
            "$attribute.valueColumnName" $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
            "$attribute.changingColumnName" $schema.metadata.changingRange
)
AS \$$\$$
    SELECT
        "$attribute.identityColumnName",
        "$attribute.anchorReferenceName",
        $(attribute.hasChecksum())? "$attribute.checksumColumnName",
        "$attribute.valueColumnName",
        "$attribute.changingColumnName"
    FROM
        "$attribute.capsule"\."$attribute.positName"
    WHERE
        "$attribute.changingColumnName" <= changingTimepoint;
\$$\$$ LANGUAGE SQL;

-- Attribute posit forwarder ------------------------------------------------------------------------------------------
-- f$attribute.positName forwarding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."f$attribute.positName" (
    changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange
)
RETURNS TABLE (
    "$attribute.identityColumnName" $attribute.identity,
    "$attribute.anchorReferenceName" $anchor.identity,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea,
    "$attribute.valueColumnName" $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
    "$attribute.changingColumnName" $schema.metadata.changingRange
)
AS \$$\$$
    SELECT
        "$attribute.identityColumnName",
        "$attribute.anchorReferenceName",
        $(attribute.hasChecksum())? "$attribute.checksumColumnName",
        "$attribute.valueColumnName",
        "$attribute.changingColumnName"
    FROM
        "$attribute.capsule"\."$attribute.positName"
    WHERE
        "$attribute.changingColumnName" > changingTimepoint;
\$$\$$ LANGUAGE SQL;

-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- r$attribute.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."r$attribute.annexName" (
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? "$attribute.metadataColumnName" $schema.metadata.metadataType,
    "$attribute.identityColumnName" $attribute.identity,
    "$attribute.positingColumnName" $schema.metadata.positingRange,
    "$attribute.positorColumnName" $schema.metadata.positorRange,
    "$attribute.reliabilityColumnName" $schema.metadata.reliabilityRange,
    "$attribute.assertionColumnName" char(1)
)
AS \$$\$$
    SELECT
        $(schema.METADATA)? "$attribute.metadataColumnName",
        "$attribute.identityColumnName",
        "$attribute.positingColumnName",
        "$attribute.positorColumnName",
        "$attribute.reliabilityColumnName",
        "$attribute.assertionColumnName"
    FROM
        "$attribute.capsule"\."$attribute.annexName"
    WHERE
        "$attribute.positingColumnName" <= positingTimepoint;
\$$\$$ LANGUAGE SQL;

-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."r$attribute.name" (
    positor $schema.metadata.positorRange = 0::$schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? "$attribute.metadataColumnName" $schema.metadata.metadataType,
    "$attribute.identityColumnName" $attribute.identity,
    "$attribute.positingColumnName" $schema.metadata.positingRange,
    "$attribute.positorColumnName" $schema.metadata.positorRange,
    "$attribute.reliabilityColumnName" $schema.metadata.reliabilityRange,
    "$attribute.assertionColumnName" char(1),
    "$attribute.anchorReferenceName" $anchor.identity,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea,
    "$attribute.valueColumnName" $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
    "$attribute.changingColumnName" $attribute.timeRange
)
AS \$$\$$
    SELECT
        $(schema.METADATA)? a."$attribute.metadataColumnName",
        p."$attribute.identityColumnName",
        a."$attribute.positingColumnName",
        a."$attribute.positorColumnName",
        a."$attribute.reliabilityColumnName",
        a."$attribute.assertionColumnName",
        p."$attribute.anchorReferenceName",
        $(attribute.hasChecksum())? p."$attribute.checksumColumnName",
        p."$attribute.valueColumnName",
        p."$attribute.changingColumnName"
    FROM
        "$attribute.capsule"\."r$attribute.positName"(changingTimepoint) p
    JOIN
        "$attribute.capsule"."r$attribute.annexName"(positingTimepoint) a
    ON
        a."$attribute.identityColumnName" = p."$attribute.identityColumnName"
    AND
        a."$attribute.positorColumnName" = positor
    AND
        a."$attribute.positingColumnName" = (
            SELECT
                sub."$attribute.positingColumnName"
            FROM
                "$attribute.capsule"\."r$attribute.annexName"(positingTimepoint) sub
            WHERE
                sub."$attribute.identityColumnName" = p."$attribute.identityColumnName"
            AND
                sub."$attribute.positorColumnName" = positor
            ORDER BY
                sub."$attribute.positingColumnName" DESC
            LIMIT 1
        );
\$$\$$ LANGUAGE SQL;

-- Attribute assembled forwarder --------------------------------------------------------------------------------------
-- f$attribute.name forwarding over changing and rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."f$attribute.name" (
    positor $schema.metadata.positorRange = 0::$schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? "$attribute.metadataColumnName" $schema.metadata.metadataType,
    "$attribute.identityColumnName" $attribute.identity,
    "$attribute.positingColumnName" $schema.metadata.positingRange,
    "$attribute.positorColumnName" $schema.metadata.positorRange,
    "$attribute.reliabilityColumnName" $schema.metadata.reliabilityRange,
    "$attribute.assertionColumnName" char(1),
    "$attribute.anchorReferenceName" $anchor.identity,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea,
    "$attribute.valueColumnName" $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
    "$attribute.changingColumnName" $schema.metadata.changingRange
)
AS \$$\$$
    SELECT
        $(schema.METADATA)? a."$attribute.metadataColumnName",
        p."$attribute.identityColumnName",
        a."$attribute.positingColumnName",
        a."$attribute.positorColumnName",
        a."$attribute.reliabilityColumnName",
        a."$attribute.assertionColumnName",
        p."$attribute.anchorReferenceName",
        $(attribute.hasChecksum())? p."$attribute.checksumColumnName",
        p."$attribute.valueColumnName",
        p."$attribute.changingColumnName"
    FROM
        "$attribute.capsule"\."f$attribute.positName" (changingTimepoint) p
    JOIN
        "$attribute.capsule"\."r$attribute.annexName" (positingTimepoint) a
    ON
        a."$attribute.identityColumnName" = p."$attribute.identityColumnName"
    AND
        a."$attribute.positorColumnName" = positor
    AND
        a."$attribute.positingColumnName" = (
            SELECT
                sub."$attribute.positingColumnName"
            FROM
                "$attribute.capsule"\."r$attribute.annexName" (positingTimepoint) sub
            WHERE
                sub."$attribute.identityColumnName" = p."$attribute.identityColumnName"
            AND
                sub."$attribute.positorColumnName" = positor
            ORDER BY
                sub."$attribute.positingColumnName" DESC
            LIMIT 1
        );
\$$\$$ LANGUAGE SQL;

-- Attribute previous value -------------------------------------------------------------------------------------------
-- pre$attribute.name function for getting previous value
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."pre$attribute.name" (
    id $anchor.identity,
    positor $schema.metadata.positorRange = 0::$schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange,
    assertion char(1) = null::char(1)
)
RETURNS $returnType
AS \$$\$$
        SELECT
            $(attribute.hasChecksum())? pre."$attribute.checksumColumnName" : pre."$attribute.valueColumnName"
        FROM
            "$attribute.capsule"\."r$attribute.name" (
                positor,
                changingTimepoint,
                positingTimepoint
            ) pre
        WHERE
            pre."$attribute.anchorReferenceName" = id
        AND
            pre."$attribute.changingColumnName" < changingTimepoint
        AND
            pre."$attribute.assertionColumnName" = coalesce(assertion, pre."$attribute.assertionColumnName")
        ORDER BY
            pre."$attribute.changingColumnName" DESC,
            pre."$attribute.positingColumnName" DESC
        LIMIT 1;
\$$\$$ LANGUAGE SQL;

-- Attribute following value ------------------------------------------------------------------------------------------
-- fol$attribute.name function for getting following value
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."fol$attribute.name" (
    id $anchor.identity,
    positor $schema.metadata.positorRange = 0::$schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange = $schema.EOT::$attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange,
    assertion char(1) = null::char(1)
)
RETURNS $returnType
AS \$$\$$
    SELECT
        $(attribute.hasChecksum())? fol."$attribute.checksumColumnName" : fol."$attribute.valueColumnName"
    FROM
        "$attribute.capsule"\."f$attribute.name" (
            positor,
            changingTimepoint,
            positingTimepoint
        ) fol
    WHERE
        fol."$attribute.anchorReferenceName" = id
    AND
        fol."$attribute.changingColumnName" > changingTimepoint
    AND
        fol."$attribute.assertionColumnName" = coalesce(assertion, fol."$attribute.assertionColumnName")
    ORDER BY
        fol."$attribute.changingColumnName" ASC,
        fol."$attribute.positingColumnName" DESC
    LIMIT 1;
\$$\$$ LANGUAGE SQL;

~*/
        } else {

/*~
-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- r$attribute.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."r$attribute.annexName" (
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? "$attribute.metadataColumnName" $schema.metadata.metadataType,
    "$attribute.identityColumnName" $attribute.identity,
    "$attribute.positingColumnName" $schema.metadata.positingRange,
    "$attribute.positorColumnName" $schema.metadata.positorRange,
    "$attribute.reliabilityColumnName" $schema.metadata.reliabilityRange,
    "$attribute.assertionColumnName" char(1)
)
AS \$$\$$
    SELECT
        $(schema.METADATA)? "$attribute.metadataColumnName",
        "$attribute.identityColumnName",
        "$attribute.positingColumnName",
        "$attribute.positorColumnName",
        "$attribute.reliabilityColumnName",
        "$attribute.assertionColumnName"
    FROM
        "$attribute.capsule"\."$attribute.annexName"
    WHERE
        "$attribute.positingColumnName" <= positingTimepoint;
\$$\$$
LANGUAGE SQL;

-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."r$attribute.name" (
    positor $schema.metadata.positorRange = 0::$schema.metadata.positorRange,
    positingTimepoint $schema.metadata.positingRange = $schema.EOT::$schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? "$attribute.metadataColumnName" $schema.metadata.metadataType,
    "$attribute.identityColumnName" $attribute.identity,
    "$attribute.positingColumnName" $schema.metadata.positingRange,
    "$attribute.positorColumnName" $schema.metadata.positorRange,
    "$attribute.reliabilityColumnName" $schema.metadata.reliabilityRange,
    "$attribute.assertionColumnName" char(1),
    "$attribute.anchorReferenceName" $anchor.identity,
    $(attribute.hasChecksum())? "$attribute.checksumColumnName" bytea,
    "$attribute.valueColumnName" $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
)
AS \$$\$$
    SELECT
        $(schema.METADATA)? a."$attribute.metadataColumnName",
        p."$attribute.identityColumnName",
        a."$attribute.positingColumnName",
        a."$attribute.positorColumnName",
        a."$attribute.reliabilityColumnName",
        a."$attribute.assertionColumnName",
        p."$attribute.anchorReferenceName",
        $(attribute.hasChecksum())? p."$attribute.checksumColumnName",
        p."$attribute.valueColumnName"
    FROM
        "$attribute.capsule"\."$attribute.positName" p
    JOIN
        "$attribute.capsule"\."r$attribute.annexName"(positingTimepoint) a
    ON
        a."$attribute.identityColumnName" = p."$attribute.identityColumnName"
    AND
        a."$attribute.positorColumnName" = positor
    AND
        a."$attribute.positingColumnName" = (
            SELECT
                sub."$attribute.positingColumnName"
            FROM
                "$attribute.capsule"\."r$attribute.annexName" (positingTimepoint) sub
            WHERE
                sub."$attribute.identityColumnName" = p."$attribute.identityColumnName"
            AND
                sub."$attribute.positorColumnName" = positor
            ORDER BY 
                sub."$attribute.positingColumnName" DESC
            LIMIT 1
        );
\$$\$$ LANGUAGE SQL;
~*/
        }
    }
}
