if(schema.TRIGGERS) {
/*~
-- ANCHOR TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest view make it behave like a table.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, knot, attribute;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$anchor.capsule"\."it_l$anchor.name"()
RETURNS TRIGGER
AS \$$\$$
DECLARE
_now $schema.metadata.chronon;
_iAnchor $anchor.identity;
BEGIN
    _now := $schema.metadata.now::$schema.metadata.chronon;
    _iAnchor := null::$anchor.identity;


    IF (NEW."$anchor.identityColumnName" is null)
    THEN -- create new anchor
    INSERT INTO "$anchor.capsule"\."$anchor.name" (
        $(schema.METADATA)? "$anchor.metadataColumnName" : "$anchor.dummyColumnName"
    ) VALUES (
        $(schema.METADATA)? NEW."$anchor.metadataColumnName" : null::boolean
    ) RETURNING "$anchor.identityColumnName"
    INTO _iAnchor;
    END IF;
~*/
        while (attribute = anchor.nextAttribute()) {
            knot = attribute.knot;
/*~
    INSERT INTO "$attribute.capsule"\."$attribute.name" (
        $(schema.METADATA)? "$attribute.metadataColumnName",
        "$attribute.anchorReferenceName",
        "$attribute.valueColumnName",
        $(attribute.timeRange)? "$attribute.changingColumnName",
        "$attribute.positingColumnName",
        "$attribute.positorColumnName",
        "$attribute.reliabilityColumnName"
    )
    SELECT
        $(schema.METADATA)? NEW."$attribute.metadataColumnName",
        NEW."$attribute.anchorReferenceName",
        $(attribute.isKnotted())? COALESCE(NEW."$attribute.valueColumnName", "k$knot.mnemonic"\."$knot.identityColumnName"), : NEW."$attribute.valueColumnName",
        $(attribute.timeRange)? NEW."$attribute.changingColumnName",
        NEW."$attribute.positingColumnName",
        NEW."$attribute.positorColumnName",
        NEW."$attribute.reliabilityColumnName"
    FROM
        NEW
~*/
            if(attribute.isKnotted()) {
/*~
    LEFT JOIN
        "$knot.capsule"\."$knot.name" "k$knot.mnemonic"
    ON
        $(knot.hasChecksum())? "k$knot.mnemonic"\."$knot.checksumColumnName" = NEW."$attribute.knotChecksumColumnName" : "k$knot.mnemonic"\."$knot.valueColumnName" = NEW."$attribute.knotValueColumnName"
    WHERE
        COALESCE(NEW."$attribute.valueColumnName", "k$knot.mnemonic"\."$knot.identityColumnName") is not null;
~*/
            }
            else {
/*~
    WHERE
        NEW."$attribute.valueColumnName" is not null;
~*/
            }
        }
/*~
END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "it_l$anchor.name" ON "$anchor.capsule"\."l$anchor.name";
CREATE TRIGGER "it_l$anchor.name"
INSTEAD OF INSERT ON "$anchor.capsule"\."l$anchor.name"
FOR EACH ROW
EXECUTE FUNCTION "$anchor.capsule"\."it_l$anchor.name"();

-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$anchor.name instead of UPDATE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$anchor.capsule"\."ut_l$anchor.name"()
RETURNS TRIGGER
AS \$$\$$
DECLARE
    _now $schema.metadata.chronon;
BEGIN
    _now := $schema.metadata.now::$schema.metadata.chronon;
    IF(NEW."$anchor.identityColumnName")
    THEN
        RAISE EXCEPTION 'The identity column $anchor.identityColumnName is not updatable.';
    END IF;
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    IF(NEW."$attribute.identityColumnName" <> OLD."$attribute.identityColumnName")
    THEN
        RAISE EXCEPTION 'The identity column $attribute.identityColumnName is not updatable.';
    END IF;
    IF(NEW."$attribute.anchorReferenceName" <> OLD."$attribute.anchorReferenceName")
    THEN
        RAISE EXCEPTION 'The foreign key column $attribute.anchorReferenceName is not updatable.';
    END IF;
    IF(NEW."$attribute.assertionColumnName" <> OLD."$attribute.assertionColumnName")
    THEN
        RAISE EXCEPTION 'The computed assertion column $attribute.assertionColumnName is not updatable.';
    END IF;
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    IF (
        $(attribute.isHistorized())? NEW."$attribute.valueColumnName" <> OLD."$attribute.valueColumnName" OR
        $(attribute.isHistorized())? NEW."$attribute.knotValueColumnName" <> OLD."$attribute.knotValueColumnName" OR
        NEW."$attribute.reliabilityColumnName" <> OLD."$attribute.reliabilityColumnName" OR
        NEW."$schema.metadata.reliabilitySuffix" <> OLD."$schema.metadata.reliabilitySuffix"
    )
    THEN
        INSERT INTO "$attribute.capsule"\."$attribute.name" (
            $(schema.METADATA)? "$attribute.metadataColumnName",
            "$attribute.anchorReferenceName",
            "$attribute.valueColumnName",
            $(attribute.isHistorized())? "$attribute.changingColumnName",
            "$attribute.positingColumnName",
            "$attribute.positorColumnName",
            "$attribute.reliabilityColumnName"
        )
        SELECT
~*/
                if(schema.METADATA) {
/*~
            COALESCE(
                CASE
                    WHEN NEW."$anchor.metadataColumnName" <> OLD."$anchor.metadataColumnName" AND NEW."$attribute.metadataColumnName" = OLD."$attribute.metadataColumnName"
                    THEN NEW."$anchor.metadataColumnName"
                    ELSE NEW."$attribute.metadataColumnName"
                END,
                NEW."$anchor.metadataColumnName"
            ),
~*/
                }
/*~
            COALESCE(NEW."$attribute.anchorReferenceName", NEW."$anchor.identityColumnName"),
            CASE
                WHEN NEW."$attribute.valueColumnName" <>  OLD."$attribute.valueColumnName" THEN NEW."$attribute.valueColumnName"
                ELSE "k$knot.mnemonic"."$knot.identityColumnName"
            END,
~*/
                if(attribute.isHistorized()) {
/*~
            cast(COALESCE(CASE
                WHEN NEW."$schema.metadata.reliabilitySuffix" <> OLD."$schema.metadata.reliabilitySuffix" AND NEW."$attribute.changingColumnName" = OLD."$attribute.changingColumnName" THEN NEW."$attribute.changingColumnName"
                WHEN NEW."$attribute.changingColumnName" <> OLD."$attribute.changingColumnName" THEN NEW."$attribute.changingColumnName"
            END, _now) as $attribute.timeRange),
~*/
                }
/*~
            cast(COALESCE(CASE
                WHEN NEW."$attribute.positingColumnName" <> OLD."$attribute.positingColumnName" THEN NEW."$attribute.positingColumnName"
            END, _now) as $schema.metadata.positingRange),
            COALESCE(CASE
                WHEN NEW."$schema.metadata.positorSuffix" <> OLD."$schema.metadata.positorSuffix" THEN NEW."$schema.metadata.positorSuffix"
                ELSE NEW."$attribute.positorColumnName"
            END, 0),
            COALESCE(CASE
                WHEN NEW."$attribute.reliabilityColumnName" <> OLD."$attribute.reliabilityColumnName" THEN NEW."$attribute.reliabilityColumnName"
                WHEN NEW."$schema.metadata.reliabilitySuffix" <> OLD."$schema.metadata.reliabilitySuffix" THEN NEW."$schema.metadata.reliabilitySuffix"
                ELSE NEW."$attribute.reliabilityColumnName"
            END, $schema.metadata.defaultReliability)
        FROM
            NEW
        LEFT JOIN
            "$knot.capsule"\."$knot.name" "k$knot.mnemonic"
        ON
            $(knot.hasChecksum())? "k$knot.mnemonic"\."$knot.checksumColumnName" = MD5(cast(NEW."$attribute.knotValueColumnName" as text)) : "k$knot.mnemonic"\."$knot.valueColumnName" = NEW."$attribute.knotValueColumnName"
        WHERE
            CASE
                WHEN NEW."$attribute.valueColumnName" <> OLD."$attribute.valueColumnName" THEN NEW."$attribute.valueColumnName"
                ELSE "k$knot.mnemonic"\."$knot.identityColumnName"
            END is not null;
    END IF;

    -- logical delete by setting to value to null
    -- note that an UPDATE SET AN_ATT_Anchor_Attribute = NULL, AN_ATT_ChangedAt = @timepoint
    -- will use @timepoint as a proxy for positing time
    IF (
        NEW."$attribute.valueColumnName" <> OLD."$attribute.valueColumnName" OR
        NEW."$attribute.knotValueColumnName" <> OLD."$attribute.knotValueColumnName"
    )
    THEN
        INSERT INTO "$attribute.capsule"\."$attribute.name" (
            $(schema.METADATA)? "$attribute.metadataColumnName",
            "$attribute.anchorReferenceName",
            "$attribute.valueColumnName",
            $(attribute.isHistorized())? "$attribute.changingColumnName",
            "$attribute.positingColumnName",
            "$attribute.positorColumnName",
            "$attribute.reliabilityColumnName"
        )
        SELECT
~*/
                if(schema.METADATA) {
/*~
            COALESCE(CASE
                WHEN NEW."$anchor.metadataColumnName" <> OLD."$anchor.metadataColumnName" AND NEW."$attribute.metadataColumnName" = OLD."$attribute.metadataColumnName"
                THEN NEW."$anchor.metadataColumnName"
                ELSE NEW."$attribute.metadataColumnName"
            END, NEW."$anchor.metadataColumnName"),
~*/
                }
/*~
            p."$attribute.anchorReferenceName",
            p."$attribute.valueColumnName",
            $(attribute.isHistorized())? p."$attribute.changingColumnName",
            cast(COALESCE(CASE
                WHEN NEW."$attribute.positingColumnName" <> OLD."$attribute.positingColumnName" THEN NEW."$attribute.positingColumnName"
                $(attribute.isHistorized())? WHEN NEW."$attribute.changingColumnName" <> OLD."$attribute.changingColumnName" THEN NEW."$attribute.changingColumnName"
            END, _now) as $schema.metadata.positingRange),
            COALESCE(CASE
                WHEN NEW."$schema.metadata.positorSuffix" <> OLD."$schema.metadata.positorSuffix" THEN NEW."$schema.metadata.positorSuffix"
                ELSE NEW."$attribute.positorColumnName"
            END, 0),
            $schema.metadata.deleteReliability
        FROM
            NEW
        JOIN
            "$attribute.capsule"\."$attribute.positName" p
        ON
            p."$attribute.identityColumnName" = NEW."$attribute.identityColumnName"
        WHERE
            (NEW."$attribute.valueColumnName" <> OLD."$attribute.valueColumnName" AND NEW."$attribute.valueColumnName" is null)
        OR
            (NEW."$attribute.knotValueColumnName" <> OLD."$attribute.knotValueColumnName" AND NEW."$attribute.knotValueColumnName" is null);
    END IF;

~*/
            }
            else { // not knotted
/*~
    IF (
        NEW."$attribute.valueColumnName" is not null AND
        $(attribute.isHistorized())? NEW."$attribute.valueColumnName" <> OLD."$attribute.valueColumnName" OR
        NEW."$attribute.reliabilityColumnName" <> OLD."$attribute.reliabilityColumnName" OR
        NEW."$schema.metadata.reliabilitySuffix" <> OLD."$schema.metadata.reliabilitySuffix"
    )
    THEN
        INSERT INTO "$attribute.capsule"\."$attribute.name" (
            $(schema.METADATA)? "$attribute.metadataColumnName",
            "$attribute.anchorReferenceName",
            "$attribute.valueColumnName",
            $(attribute.isHistorized())? "$attribute.changingColumnName",
            "$attribute.positingColumnName",
            "$attribute.positorColumnName",
            "$attribute.reliabilityColumnName"
        )
        VALUES(
~*/
                if(schema.METADATA) {
/*~
            COALESCE(CASE
                WHEN NEW."$anchor.metadataColumnName" <> OLD."$anchor.metadataColumnName" AND NEW."$attribute.metadataColumnName" = OLD."$attribute.metadataColumnName"
                THEN NEW."$anchor.metadataColumnName"
                ELSE NEW."$attribute.metadataColumnName"
            END, NEW."$anchor.metadataColumnName"),
~*/
                }
/*~
            COALESCE(NEW."$attribute.anchorReferenceName", NEW."$anchor.identityColumnName"),
            NEW."$attribute.valueColumnName",
~*/
                if(attribute.isHistorized()) {
/*~
            cast(COALESCE(CASE
                WHEN NEW."$schema.metadata.reliabilitySuffix" <> OLD."$schema.metadata.reliabilitySuffix" AND NEW."$attribute.changingColumnName" <> OLD."$attribute.changingColumnName" THEN NEW."$attribute.changingColumnName"
                WHEN NEW."$attribute.changingColumnName" <> OLD."$attribute.changingColumnName" THEN NEW."$attribute.changingColumnName"
            END, _now) as $attribute.timeRange),
~*/
                }
/*~
            cast(COALESCE(CASE
                WHEN NEW."$attribute.positingColumnName" <> OLD."$attribute.positingColumnName" THEN NEW."$attribute.positingColumnName"
            END, _now) as $schema.metadata.positingRange),
            COALESCE(CASE
                WHEN NEW."$schema.metadata.positorSuffix" <> OLD."$schema.metadata.positorSuffix" THEN NEW."$schema.metadata.positorSuffix"
                ELSE NEW."$attribute.positorColumnName"
            END, 0),
            COALESCE(CASE
                WHEN NEW."$attribute.reliabilityColumnName" <> OLD."$attribute.reliabilityColumnName" THEN NEW."$attribute.reliabilityColumnName"
                WHEN NEW."$schema.metadata.reliabilitySuffix" <> OLD."$attribute.reliabilityColumnName" THEN NEW."$schema.metadata.reliabilitySuffix"
                ELSE NEW."$attribute.reliabilityColumnName"
            END, $schema.metadata.defaultReliability)
        );
    END IF;

    -- logical delete by setting to value to null
    -- note that an UPDATE SET AN_ATT_Anchor_Attribute = NULL, AN_ATT_ChangedAt = @timepoint
    -- will use @timepoint as a proxy for positing time
    IF (
        NEW."$attribute.valueColumnName" is null AND
        NEW."$attribute.valueColumnName" <> OLD."$attribute.valueColumnName"
    )
    THEN
        INSERT INTO "$attribute.capsule"\."$attribute.name" (
            $(schema.METADATA)? "$attribute.metadataColumnName",
            "$attribute.anchorReferenceName",
            "$attribute.valueColumnName",
            $(attribute.isHistorized())? "$attribute.changingColumnName",
            "$attribute.positingColumnName",
            "$attribute.positorColumnName",
            "$attribute.reliabilityColumnName"
        )
        SELECT
~*/
                if(schema.METADATA) {
/*~
            COALESCE(CASE
                WHEN NEW."$anchor.metadataColumnName" <> OLD."$anchor.metadataColumnName" AND NEW."$attribute.metadataColumnName" = OLD."$attribute.metadataColumnName"
                THEN NEW."$anchor.metadataColumnName"
                ELSE NEW."$attribute.metadataColumnName"
            END, NEW."$anchor.metadataColumnName"),
~*/
                }
/*~
            p."$attribute.anchorReferenceName",
            p."$attribute.valueColumnName",
            $(attribute.isHistorized())? p."$attribute.changingColumnName",
            cast(COALESCE(CASE
                WHEN NEW."$attribute.positingColumnName" <> OLD."$attribute.positingColumnName" THEN NEW."$attribute.positingColumnName"
                $(attribute.isHistorized())? WHEN NEW."$attribute.changingColumnName" <> OLD."$attribute.changingColumnName" THEN NEW."$attribute.changingColumnName"
            END, _now) as $schema.metadata.positingRange),
            COALESCE(CASE
                WHEN NEW."$schema.metadata.positorSuffix" <> OLD."$schema.metadata.positorSuffix" THEN NEW."$schema.metadata.positorSuffix"
                ELSE NEW."$attribute.positorColumnName"
            END, 0),
            $schema.metadata.deleteReliability
        FROM
            NEW
        JOIN
            "$attribute.capsule"\."$attribute.positName" p
        ON
            p."$attribute.identityColumnName" = NEW."$attribute.identityColumnName";
    END IF;
~*/
            } // end of not knotted
        } // end of while loop over attributes
/*~
END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "ut_l$anchor.name" ON "$anchor.capsule"\."l$anchor.name";
CREATE TRIGGER "ut_l$anchor.name"
INSTEAD OF UPDATE ON "$anchor.capsule"\."l$anchor.name"
FOR EACH ROW
EXECUTE FUNCTION "$anchor.capsule"\."ut_l$anchor.name"();
~*/
    } // end of if attributes exist
    if(anchor.hasMoreAttributes()) {
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$anchor.capsule"\."dt_l$anchor.name"()
RETURNS TRIGGER
AS \$$\$$
DECLARE
    _now $schema.metadata.chronon;
BEGIN
    _now := $schema.metadata.now::$schema.metadata.chronon;
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    INSERT INTO "$attribute.capsule"\."$attribute.annexName" (
        $(schema.METADATA)? "$attribute.metadataColumnName",
        "$attribute.identityColumnName",
        "$attribute.positorColumnName",
        "$attribute.positingColumnName",
        "$attribute.reliabilityColumnName"
    )
    SELECT
        $(schema.METADATA)? p."$attribute.metadataColumnName",
        p."$attribute.identityColumnName",
        p."$attribute.positorColumnName",
        _now,
        $schema.metadata.deleteReliability
    FROM
        OLD
    JOIN
        "$attribute.capsule"\."$attribute.annexName" p
    ON
        p."$attribute.identityColumnName" = OLD."$attribute.identityColumnName";
~*/
        }
/*~
END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "dt_l$anchor.name" ON "$anchor.capsule"\."l$anchor.name";
CREATE TRIGGER "dt_l$anchor.name"
INSTEAD OF DELETE ON "$anchor.capsule"\."l$anchor.name"
FOR EACH ROW
EXECUTE FUNCTION "$anchor.capsule"\."dt_l$anchor.name"();

~*/
    }
}
}