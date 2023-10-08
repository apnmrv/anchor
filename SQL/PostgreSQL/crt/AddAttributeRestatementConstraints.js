var anchor, knot, attribute, restatements = false;
while (anchor = schema.nextAnchor())
    while(attribute = anchor.nextAttribute())
        if(attribute.isHistorized())
            restatements = true;

if(restatements) {
/*~
-- ATTRIBUTE RESTATEMENT CONSTRAINTS ----------------------------------------------------------------------------------
--
-- Attributes may be prevented from storing restatements.
-- A restatement is when the same value occurs for two adjacent points
-- in changing time. Note that restatement checking is not done for
-- unreliable information as this could prevent demotion.
--
-- returns      1 for at least one equal surrounding value, 0 for different surrounding values
--
-- @posit       the id of the posit that should be checked
-- @posited     the time when this posit was made
-- @positor     the one who made the posit
-- @assertion   whether this posit is positively or negatively asserted, or unreliable
--
~*/
    while (anchor = schema.nextAnchor()) {
        while(attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
                var valueColumn, valueType;
                if(!attribute.isKnotted()) {
                    if(attribute.hasChecksum()) {
                        valueColumn = attribute.checksumColumnName;
                        valueType = 'bytea';
                    }
                    else {
                        valueColumn = attribute.valueColumnName;
                        valueType = attribute.dataRange;
                    }
                }
                else {
                    knot = attribute.knot;
                    valueColumn = attribute.knotReferenceName;
                    valueType = knot.identity;
                }
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$attribute.name restatement finder, also used by the insert and update triggers for idempotent attributes
-- rc$attribute.name restatement constraint (available only in attributes that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."rf$attribute.name" (
    posit $anchor.identity,
    posited $schema.metadata.positingRange,
    positor $schema.metadata.positorRange,
    assertion char(1)
)
RETURNS smallint
AS \$$\$$
DECLARE
    _posit $anchor.identity;
    _posited $schema.metadata.positingRange;
    _positor $schema.metadata.positorRange;
    _assertion char(1);
BEGIN
    _posit := posit;
    _posited := posited;
    _positor := positor;
    _assertion := assertion;
    IF assertion = '?'
    THEN RETURN 0;
    ELSE
        IF EXISTS (
                SELECT
                    a.value
                FROM (
                    SELECT
                        "$attribute.anchorReferenceName"    as anchor,
                        "$valueColumn"                      as value,
                        "$attribute.changingColumnName"     as changed
                    FROM
                        "$attribute.capsule"\."$attribute.positName"
                    WHERE
                        "$attribute.identityColumnName" = _posit
                ) a
                WHERE
                    "$attribute.capsule"\."pre$attribute.name" (
                        id := a.anchor,
                        positor := _positor,
                        changingTimepoint := a.changed,
                        positingTimepoint := _posited,
                        assertion := _assertion
                    ) = a.value
                    OR
                    "$attribute.capsule"\."fol$attribute.name" (
                        id := a.anchor,
                        positor := _positor,
                        changingTimepoint := a.changed,
                        positingTimepoint := _posited,
                        assertion := _assertion
                    ) = a.value
            )
        THEN RETURN 1;
        ELSE RETURN 0;
        END IF;
    END IF;
END;
\$$\$$ LANGUAGE plpgsql;
~*/
                if(!attribute.isRestatable()) {
/*~
ALTER TABLE "$attribute.capsule"\."$attribute.annexName"
ADD CONSTRAINT "rc$attribute.annexName" CHECK (
    "$attribute.capsule"\."rf$attribute.name" (
        "$attribute.identityColumnName",
        "$attribute.positingColumnName",
        "$attribute.positorColumnName",
        "$attribute.assertionColumnName"
    ) = 0
);
~*/
                }
            }
        }
    }
}

