/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--
-- Positor table ------------------------------------------------------------------------------------------------------
~*/

var positorSuffix = quoted("_" + schemaMetadata.positorSuffix);
var pkPositorSuffix = quoted("pk_" + schemaMetadata.positorSuffix);

/*~
CREATE TABLE IF NOT EXISTS $capsuleNameQuoted\.$positorSuffix (
    $positorSuffix $schemaMetadata.positorRange not null,
    constraint $pkPositorSuffix primary key (
        $positorSuffix
    )
);
INSERT INTO $capsuleNameQuoted\.$positorSuffix (
    $positorSuffix
)
VALUES (
    0 -- the default positor
);
~*/