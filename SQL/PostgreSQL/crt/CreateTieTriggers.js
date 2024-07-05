if(schema.TRIGGERS) {
/*~
-- TIE TRIGGERS -------------------------------------------------------------------------------------------------------
--
-- The following triggers on the assembled and latest views make them behave like tables.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent ties, only changes that represent values different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
    var tie, role, knot, anchor;
    while (tie = schema.nextTie()) {
        var changingParameterDefinition = tie.isHistorized() ? 'changingTimepoint := NEW."' + tie.changingColumnName + '",': '';
        positStatementTypes = "'N'", annexStatementTypes = "'N'";
        if(tie.isAssertive()) {
            annexStatementTypes += ",'D'";
        }
        if(tie.isHistorized() && !tie.isIdempotent()) {
            positStatementTypes += ",'R'";
            annexStatementTypes += ",'R'";
        }
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$tie.name instead of INSERT trigger on $tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$tie.capsule"\."it_$tie.name"()
RETURNS TRIGGER
AS \$$\$$

DECLARE
    _now $schema.metadata.chronon;
    _statementType char(1);
BEGIN
    _now := $schema.metadata.now::$schema.metadata.chronon;
    SELECT
        CASE
            WHEN EXISTS (
                SELECT
                    t."$tie.identityColumnName"
                FROM
                    "$tie.capsule"\."t$tie.name"(
                            NEW."$tie.positorColumnName",
                            $changingParameterDefinition
                            NEW."$tie.positingColumnName",
                            NEW."$tie.assertionColumnName"
                        ) t
                WHERE
                    t."$tie.reliabilityColumnName" = NEW."$tie.reliabilityColumnName"
                $(tie.isHistorized())? AND
                    $(tie.isHistorized())? t."$tie.changingColumnName" = NEW."$tie.changingColumnName"
~*/
        while(role = tie.nextRole()) {
/*~
                AND
                    t."$role.columnName" = NEW."$role.columnName"
~*/
        }
/*~
            )
            THEN 'D' -- duplicate assertion
            WHEN p."$tie.identityColumnName" is not null
            THEN 'S' -- duplicate statement
~*/
        if(tie.isHistorized() && tie.hasMoreValues()) {
/*~
            WHEN (
            SELECT
                COUNT(*)
            FROM (
                SELECT
~*/
            while(role = tie.nextValue()) {
/*~
                    pre."$role.columnName$"(tie.hasMoreValues())?,
~*/
            }
/*~
        FROM
            "$tie.capsule"\."r$tie.name" (
                NEW."$tie.positorColumnName",
                NEW."$tie.changingColumnName",
                NEW."$tie.positingColumnName"
            ) pre
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
            pre."$role.columnName" = NEW."$role.columnName"
        AND
~*/
                }
            }
            else {
/*~
            (
~*/
                while(role = tie.nextValue()) {
/*~
                pre."$role.columnName" = NEW."$role.columnName"
            $(tie.hasMoreValues())? AND
~*/
                }
/*~
        )
        AND
~*/
            }
/*~
            pre."$tie.changingColumnName" < NEW."$tie.changingColumnName"
        AND
            pre."$tie.assertionColumnName" = NEW."$tie.assertionColumnName"
        ORDER BY
            pre."$tie.changingColumnName" DESC,
            pre."$tie.positingColumnName" DESC
        LIMIT 1
        UNION
        SELECT
~*/
            while(role = tie.nextValue()) {
/*~
            fol."$role.columnName"$(tie.hasMoreValues())?,
~*/
            }
/*~
        FROM
            "$tie.capsule"\."f$tie.name" (
                NEW."$tie.positorColumnName",
                NEW."$tie.changingColumnName",
                NEW."$tie.positingColumnName"
            ) fol
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
            fol."$role.columnName" = NEW."$role.columnName"
        AND
~*/
                }
            }
            else {
/*~
        (
~*/
                while(role = tie.nextValue()) {
/*~
                fol."$role.columnName" = NEW."$role.columnName'
            $(tie.hasMoreValues())? AND
~*/
                }
/*~
        )
        AND
~*/
            }
/*~
                fol."$tie.changingColumnName" > NEW."$tie.changingColumnName"
            AND
                fol."$tie.assertionColumnName" = NEW."$tie.assertionColumnName"
            ORDER BY
                fol."$tie.changingColumnName" ASC,
                fol."$tie.positingColumnName" DESC
            LIMIT 1
        ) s
        WHERE
~*/
            while(role = tie.nextValue()) {
/*~
            s."$role.columnName" = NEW."$role.columnName"
        $(tie.hasMoreValues())? AND
~*/
            }
/*~
        ) > 0
        THEN 'R' -- restatement
~*/
        }
/*~
                ELSE 'N' -- new statement
            END
    FROM
        NEW
    LEFT JOIN
        "$tie.capsule"\."$tie.positName" p
    ON
~*/
        while(role = tie.nextRole()) {
/*~
        p."$role.columnName" = NEW."$role.columnName"
    $(tie.hasMoreRoles())? AND
~*/
        }
/*~
    $(tie.isHistorized())? AND
        $(tie.isHistorized())? p."$tie.changingColumnName" = NEW."$tie.changingColumnName"
    INTO _statementType;

    IF (_statementType IN ($positStatementTypes))
    THEN
        INSERT INTO "$tie.capsule"\."$tie.positName" (
            $(tie.isHistorized())? "$tie.changingColumnName",
~*/
        while(role = tie.nextRole()) {
/*~
            "$role.columnName"$(tie.hasMoreRoles())?,
~*/
        }
/*~
        )
        VALUES (
            $(tie.isHistorized())? NEW."$tie.changingColumnName",
~*/
        while(role = tie.nextRole()) {
/*~
            NEW."$role.columnName"$(tie.hasMoreRoles())?,
~*/
        }
/*~
        );
    ELSE
        IF (_statementType IN ('S',$annexStatementTypes))
        THEN
        INSERT INTO "$tie.capsule"\."$tie.annexName" (
            $(schema.METADATA)? "$tie.metadataColumnName",
            "$tie.identityColumnName",
            "$tie.positorColumnName",
            "$tie.positingColumnName",
            "$tie.reliabilityColumnName"
        )
        SELECT
            $(schema.METADATA)? NEW."$tie.metadataColumnName",
            p."$tie.identityColumnName",
            NEW."$tie.positorColumnName",
            NEW."$tie.positingColumnName",
            NEW."$tie.reliabilityColumnName"
        FROM
            NEW
        JOIN
            "$tie.capsule"\."$tie.positName" p
        ON
~*/
        while(role = tie.nextRole()) {
/*~
            p."$role.columnName" = NEW."$role.columnName"
        $(tie.hasMoreRoles())? AND
~*/
        }
/*~
        $(tie.isHistorized())? AND
            $(tie.isHistorized())? p."$tie.changingColumnName" = NEW."$tie.changingColumnName"
~*//*~;
        END IF;
    END IF;
END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "it_$tie.name" ON "$tie.capsule"\."$tie.name";
CREATE TRIGGER "it_$tie.name"
INSTEAD OF INSERT ON "$tie.capsule"\."$tie.name"
FOR EACH ROW
EXECUTE FUNCTION "$tie.capsule"\."it_$tie.name"();
~*/
// Here comes the trigger on the latest view, using the trigger above
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$tie.capsule"\."it_l$tie.name"()
RETURNS TRIGGER
AS \$$\$$
BEGIN
    INSERT INTO "$tie.capsule"\."$tie.name" (
        $(schema.METADATA)? "$tie.metadataColumnName",
        $(tie.isHistorized())? "$tie.changingColumnName",
~*/
        while (role = tie.nextRole()) {
/*~
        "$role.columnName",
~*/
        }
/*~
        "$tie.positorColumnName",
        "$tie.positingColumnName",
        "$tie.reliabilityColumnName"
    )
    SELECT
        $(schema.METADATA)? NEW."$tie.metadataColumnName",
        $(tie.isHistorized())? NEW."$tie.changingColumnName",
~*/
        while (role = tie.nextRole()) {
/*~
        $(role.knot)? coalesce(NEW."$role.columnName", "$role.name"."$role.knot.identityColumnName"), : NEW."$role.columnName",
~*/
        }
/*~
        NEW."$tie.positorColumnName",
        NEW."$tie.positingColumnName",
        NEW."$tie.reliabilityColumnName"
    FROM
        NEW ~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
    LEFT JOIN
        "$knot.capsule"\."$knot.name" "$role.name"
    ON
        "$role.name"."$knot.valueColumnName" = NEW."$role.knotValueColumnName"~*/
        }
/*~;
END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "it_l$tie.name" ON "$tie.capsule"\."l$tie.name";
CREATE TRIGGER "it_l$tie.name"
INSTEAD OF INSERT ON "$tie.capsule"\."l$tie.name"
FOR EACH ROW
EXECUTE FUNCTION "$tie.capsule"\."it_l$tie.name"();
~*/
        if(tie.hasMoreValues()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$tie.name instead of UPDATE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$tie.capsule"\."ut_l$tie.name"()
RETURNS TRIGGER
AS \$$\$$
DECLARE
    _now $schema.metadata.chronon;
BEGIN
    _now = $schema.metadata.now::$schema.metadata.chronon;

    IF(NEW."$tie.assertionColumnName" <> OLD."$tie.assertionColumnName")
    THEN
        RAISE EXCEPTION 'The computed assertion column $tie.assertionColumnName is not updatable.';
    END IF;
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
    IF(NEW."$role.columnName" <> OLD."$role.columnName")
    THEN
        RAISE EXCEPTION 'The identity column $role.columnName is not updatable.';
    END IF;
~*/
                }
            }
/*~
    INSERT INTO "$tie.capsule"\."$tie.name" (
        $(schema.METADATA)? "$tie.metadataColumnName",
        $(tie.isHistorized())? "$tie.changingColumnName",
~*/
            while (role = tie.nextRole()) {
/*~
        "$role.columnName",
~*/
            }
/*~
        "$tie.positorColumnName",
        "$tie.positingColumnName",
        "$tie.reliabilityColumnName"
    )
    SELECT
        $(schema.METADATA)? NEW."$tie.metadataColumnName",
        $(tie.isHistorized())? cast(CASE WHEN NEW."$tie.changingColumnName" <> OLD."$tie.changingColumnName") THEN NEW."$tie.changingColumnName" ELSE _now END as $tie.timeRange),
~*/
            while (role = tie.nextRole()) {
/*~
        $(role.knot)? CASE WHEN NEW."$role.knotValueColumnName" <> OLD."$role.knotValueColumnName" THEN "$role.name"\."$role.knot.identityColumnName" ELSE NEW."$role.columnName" END, : NEW."$role.columnName",
~*/
            }
/*~
        CASE WHEN NEW."$tie.positorColumnName" <> OLD."$tie.positorColumnName" THEN NEW."$tie.positorColumnName" ELSE 0 END,
        cast(CASE WHEN NEW."$tie.positingColumnName" <> OLD."$tie.positingColumnName" THEN NEW.$tie.positingColumnName ELSE _now END as $schema.metadata.positingRange),
        CASE
            WHEN
~*/
            while(role = tie.nextValue()) {
/*~
                NEW."$role.columnName" is null
            $(tie.hasMoreValues())? OR
~*/
            }
/*~
            THEN $schema.metadata.deleteReliability
            WHEN NEW."$tie.reliabilityColumnName" <> OLD."$tie.reliabilityColumnName" THEN NEW."$tie.reliabilityColumnName"
            ELSE $schema.metadata.defaultReliability
        END
    FROM
        NEW ~*/
            while (role = tie.nextKnotRole()) {
                knot = role.knot;
/*~
    LEFT JOIN
        "$knot.capsule"\."$knot.name" "$role.name"
    ON
        "$role.name"\."$knot.valueColumnName" = NEW."$role.knotValueColumnName"~*/
            }
/*~;
END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "ut_l$tie.name" ON "$tie.capsule"\."l$tie.name";
CREATE TRIGGER "ut_l$tie.name"
INSTEAD OF INSERT ON "$tie.capsule"\."l$tie.name"
FOR EACH ROW
EXECUTE FUNCTION "$tie.capsule"\."ut_l$tie.name"();
~*/
        }
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$tie.name instead of DELETE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$tie.capsule"\."dt_l$tie.name"()
RETURNS TRIGGER
AS \$$\$$
DECLARE
    _now $schema.metadata.chronon;
BEGIN
    _now := $schema.metadata.now::$schema.metadata.chronon;
    INSERT INTO "$tie.capsule"\."$tie.annexName" (
        $(schema.METADATA)? "$tie.metadataColumnName",
        "$tie.identityColumnName",
        "$tie.positorColumnName",
        "$tie.positingColumnName",
        "$tie.reliabilityColumnName"
    )
    VALUES (
        $(schema.METADATA)? OLD."$tie.metadataColumnName",
        OLD."$tie.identityColumnName",
        OLD."$tie.positorColumnName",
        _now,
        $schema.metadata.deleteReliability
    );

END;
\$$\$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "dt_l$tie.name" ON "$tie.capsule"\."l$tie.name";
CREATE TRIGGER "dt_l$tie.name"
INSTEAD OF DELETE ON "$tie.capsule"\."l$tie.name"
FOR EACH ROW
EXECUTE FUNCTION "$tie.capsule"\."dt_l$tie.name"();
~*/
    }
}