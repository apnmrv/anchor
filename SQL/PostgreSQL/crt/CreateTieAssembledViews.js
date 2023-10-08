/*~
-- TIE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------------
--
-- The assembled view of a tie combines the posit and annex table of the tie.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var tie;
while (tie = schema.nextTie()) {
    if(schema.METADATA)
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
/*~
-- Tie assembled view -------------------------------------------------------------------------------------------------
-- $tie.name assembled view of the posit and annex tables,
-- pk$tie.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW "$tie.capsule"\."$tie.name"
AS
    SELECT
        $(schema.METADATA)? a."$tie.metadataColumnName",
        p."$tie.identityColumnName",
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
        p."$role.columnName",
~*/
    }
/*~
        $(tie.timeRange)? p."$tie.changingColumnName",
        a."$tie.positingColumnName",
        a."$tie.positorColumnName",
        a."$tie.reliabilityColumnName",
        a."$tie.assertionColumnName"
    FROM
        "$tie.capsule"."$tie.positName" p
    JOIN
        "$tie.capsule"\."$tie.annexName" a
    ON
        a."$tie.identityColumnName" = p."$tie.identityColumnName";
 ~*/
}