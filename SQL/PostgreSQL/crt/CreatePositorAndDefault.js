/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--
-- Positor table ------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "$schema.metadata.encapsulation"\."_$schema.metadata.positorSuffix" (
    "$schema.metadata.positorSuffix" $schema.metadata.positorRange not null,
    constraint "pk_$schema.metadata.positorSuffix" primary key (
        "$schema.metadata.positorSuffix"
    )
);

CREATE INDEX "idx_$schema.metadata.positorSuffix" ON "$schema.metadata.encapsulation"\."_$schema.metadata.positorSuffix" (
       "$schema.metadata.positorSuffix" asc
);

INSERT INTO "$schema.metadata.encapsulation"\."_$schema.metadata.positorSuffix" (
    "$schema.metadata.positorSuffix"
) VALUES (
    0 -- the default positor
);
~*/