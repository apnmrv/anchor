/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--
-- Positor table ------------------------------------------------------------------------------------------------------
~*/
var metadata = schema.metadata;
var capsule = metadata.encapsulation;
var positorSuffix = metadata.positorSuffix;
/*~
CREATE TABLE IF NOT EXISTS $capsule\._$positorSuffix (
    $positorSuffix $schema.metadata.positorRange not null,
    constraint pk_$positorSuffix primary key (
        $positorSuffix asc
    )
);
INSERT INTO $capsule._$positorSuffix (
    $positorSuffix
)
VALUES (
    0 -- the default positor
);
~*/