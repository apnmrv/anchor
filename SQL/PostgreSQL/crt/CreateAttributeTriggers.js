if(schema.TRIGGERS) {
/*~
-- ATTRIBUTE TRIGGERS ------------------------------------------------------------------------------------------------
--
-- The following triggers on the assembled views make them behave like tables.
-- There is one 'instead of' trigger for: insert.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
-- Note, that in PostgreSQL, INSTEAD OF INSERT triggers on views are row-level
-- triggers, which means they execute once per row being inserted.
--
~*/
    var anchor, attribute;
    while (anchor = schema.nextAnchor()) {
        while(attribute = anchor.nextAttribute()) {
            var annexStatementTypes = "'N'", positStatementTypes = "'N'";
            if(attribute.isAssertive()) {
                annexStatementTypes += ",'D'";
            }
            if(attribute.isHistorized() && !attribute.isIdempotent()) {
                annexStatementTypes += ",'R'";
                positStatementTypes += ",'R'";
            }
            var changingTimepointParameterDefinition = attribute.isHistorized() ? 'changingTimepoint := NEW."' + attribute.changingColumnName + '",': '';
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_$attribute.name instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "$attribute.capsule"\."it_$attribute.name"()
RETURNS TRIGGER
AS \$$\$$
    DECLARE statementType char(1);
    BEGIN
        -- Custom logic to insert data into the underlying tables.
        statementType := (
        SELECT
            CASE
                WHEN EXISTS (
                    SELECT
                        t."$attribute.identityColumnName"
                    FROM
                        "$anchor.capsule"\."t$anchor.name" (
                                positor := NEW."$attribute.positorColumnName",
                                $changingTimepointParameterDefinition
                                positingTimepoint := NEW."$attribute.positingColumnName",
                                assertion := NEW."$attribute.assertionColumnName"
                         ) t
                    WHERE
                        t."$attribute.anchorReferenceName" = NEW."$attribute.anchorReferenceName"
                    $(attribute.isHistorized())? AND
                        $(attribute.isHistorized())? t."$attribute.changingColumnName" = NEW."$attribute.changingColumnName"
                    AND
                        t."$attribute.reliabilityColumnName" = NEW."$attribute.reliabilityColumnName"
                    AND
                        $(attribute.hasChecksum())? t."$attribute.checksumColumnName" = NEW."$attribute.checksumColumnName" : t."$attribute.valueColumnName" = NEW."$attribute.valueColumnName"
                )
                THEN 'D' -- duplicate assertion
                WHEN p."$attribute.anchorReferenceName" is not null
                THEN 'S' -- duplicate statement
~*/
            if(attribute.isHistorized()) {
                /*~
                WHEN EXISTS (
                    SELECT
                        $(attribute.hasChecksum())? NEW."$attribute.checksumColumnName" : NEW."$attribute.valueColumnName"
                    WHERE
                        $(attribute.hasChecksum())? NEW."$attribute.checksumColumnName" =  : NEW."$attribute.valueColumnName" =
                            "$attribute.capsule"\."pre$attribute.name" (
                                id := NEW."$attribute.anchorReferenceName",
                                positor := NEW."$attribute.positorColumnName",
                                $changingTimepointParameterDefinition
                                positingTimepoint := NEW."$attribute.positingColumnName",
                                assertion := NEW."$attribute.assertionColumnName"
                            )
                ) OR EXISTS (
                    SELECT
                        $(attribute.hasChecksum())? NEW."$attribute.checksumColumnName" : NEW."$attribute.valueColumnName"
                    WHERE
                        $(attribute.hasChecksum())? NEW."$attribute.checksumColumnName" = : NEW."$attribute.valueColumnName" =
                            "$attribute.capsule"\."fol$attribute.name" (
                                id := NEW."$attribute.anchorReferenceName",
                                positor := NEW."$attribute.positorColumnName",
                                changingTimepoint := NEW."$attribute.changingColumnName",
                                positingTimepoint := NEW."$attribute.positingColumnName",
                                assertion := NEW."$attribute.assertionColumnName"
                            )
                )
                THEN 'R' -- restatement
~*/
            }
/*~
                ELSE 'N' -- new statement
            END
        FROM "$attribute.capsule"\."$attribute.positName" p
        WHERE
            p."$attribute.anchorReferenceName" = NEW."$attribute.anchorReferenceName"
        $(attribute.isHistorized())? AND
            $(attribute.isHistorized())? p."$attribute.changingColumnName" = NEW."$attribute.changingColumnName"
        AND
            $(attribute.hasChecksum())? p."$attribute.checksumColumnName" = NEW."$attribute.checksumColumnName" : p."$attribute.valueColumnName" = NEW."$attribute.valueColumnName"
        );

        IF statementType in ($positStatementTypes)
        THEN -- Insert into "$attribute.capsule"\."$attribute.positName"
            INSERT INTO "$attribute.capsule"\."$attribute.positName" (
                "$attribute.anchorReferenceName",
                $(attribute.isHistorized())? "$attribute.changingColumnName",
                "$attribute.valueColumnName"
            )
            VALUES (
                NEW."$attribute.anchorReferenceName",
                $(attribute.isHistorized())? NEW."$attribute.changingColumnName",
                NEW."$attribute.valueColumnName"
            );

        ELSE
            IF statementType in ('S',$annexStatementTypes) -- Insert into $attribute.capsule\.$attribute.annexName
            THEN
                INSERT INTO "$attribute.capsule"\."$attribute.annexName" (
                    $(schema.METADATA)? "$attribute.metadataColumnName",
                    "$attribute.identityColumnName",
                    "$attribute.positorColumnName",
                    "$attribute.positingColumnName",
                    "$attribute.reliabilityColumnName"
                )
                SELECT
                    $(schema.METADATA)? NEW."$attribute.metadataColumnName",
                    p."$attribute.identityColumnName",
                    NEW."$attribute.positorColumnName",
                    NEW."$attribute.positingColumnName",
                    NEW."$attribute.reliabilityColumnName"
                FROM "$attribute.capsule"\."$attribute.positName" p
                WHERE
                    p."$attribute.anchorReferenceName" = NEW."$attribute.anchorReferenceName"
                $(attribute.isHistorized())? AND
                    $(attribute.isHistorized())? p."$attribute.changingColumnName" = NEW."$attribute.changingColumnName"
                AND
                    $(attribute.hasChecksum())? p."$attribute.checksumColumnName" = NEW."$attribute.checksumColumnName" : p."$attribute.valueColumnName" = NEW."$attribute.valueColumnName";
            END IF;
        END IF;
    END;
\$$\$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS "it_$attribute.name" ON "$attribute.capsule"\."$attribute.name";
CREATE TRIGGER "it_$attribute.name"
INSTEAD OF INSERT ON "$attribute.capsule"\."$attribute.name"
FOR EACH ROW
EXECUTE FUNCTION "$attribute.capsule"\."it_$attribute.name"();
~*/
        } // end of loop over attributes
    }
}