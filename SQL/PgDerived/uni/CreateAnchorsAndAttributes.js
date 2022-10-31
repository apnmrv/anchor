/*~
-- ANCHORS AND ATTRIBUTES ---------------------------------------------------------------------------------------------
--
-- Anchors are used to store the identities of entities.
-- Anchors are immutable.
-- Attributes are used to store values for properties of entities.
-- Attributes are mutable, their values may change over one or more types of time.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
-- Anchors may have zero or more adjoined attributes.
--
~*/
var anchor, tableOptions;
while (anchor = schema.nextAnchor()) {
    if(anchor.isGenerator())
        anchor.identityGenerator = schema.metadata.identityProperty;
    // set options per dialect
    switch (schema.metadata.databaseTarget) {
        //case 'PostgreSQL':
        //break;
        case 'Redshift':
            tableOptions = `DISTSTYLE KEY DISTKEY(${anchor.identityColumnName}) SORTKEY(${anchor.identityColumnName})`;
        break;            
        case 'Vertica':
            tableOptions = `ORDER BY ${anchor.identityColumnName} SEGMENTED BY MODULARHASH(${anchor.identityColumnName}) ALL NODES`;
        break;                
        case 'Snowflake':
            tableOptions = `CLUSTER BY (${anchor.identityColumnName})` ;
        break;
        default:
            tableOptions = '';
    }
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $anchor.capsule\.$anchor.name (
    $anchor.identityColumnName $anchor.identity $(anchor.isGenerator())? $anchor.identityGenerator NOT NULL, : NOT NULL,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType NOT NULL, : $anchor.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName 
    )
) $tableOptions 
;
~*/
    var knot, attribute, indexOptions, partitionOptions, sortColumns, checksumOptions;
    while (attribute = anchor.nextAttribute()) {
        // set options per dialect
        sortColumns = attribute.anchorReferenceName + (attribute.isHistorized() ? `, ${attribute.changingColumnName}` : '');
        switch (schema.metadata.databaseTarget) {
            case 'PostgreSQL':
                //  partitioning in PG is not dydnamic!
                //  partition = schema.PARTITIONING ? ` PARTITION BY LIST (${attribute.equivalentColumnName})` : '' ;
                //  partition = schema.PARTITIONING ? ` PARTITION BY RANGE (${attribute.equivalentColumnName})` : '' ;
                checksumOptions = `bytea generated always as (cast(MD5(cast(${attribute.valueColumnName} as text)) as bytea)) stored`;
                indexOptions = attribute.isKnotted()  
                             ? `INCLUDE (${attribute.knotReferenceName})` 
                             : `INCLUDE (${attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName})`;
                tableOptions = '';
                partitionOptions = '';
            break;
            case 'Redshift':
                checksumOptions = `varbyte(16) DEFAULT cast(MD5(cast(${attribute.valueColumnName} as text)) as varbyte(16))`;
                indexOptions = '';
                tableOptions = `DISTSTYLE KEY DISTKEY(${attribute.anchorReferenceName}) SORTKEY(${sortColumns})`
                partitionOptions = '';
            break;             
            case 'Vertica':
                checksumOptions = `int DEFAULT hash(${attribute.valueColumnName})`;
                indexOptions = '';
                tableOptions = `ORDER BY ${sortColumns} SEGMENTED BY MODULARHASH(${attribute.anchorReferenceName}) ALL NODES`
                partitionOptions = schema.PARTITIONING ? `PARTITION BY (${attribute.equivalentColumnName})` : '' ;
            break;                
            case 'Snowflake':
                checksumOptions = `numeric(19,0) DEFAULT hash(${attribute.valueColumnName})`;
                indexOptions = '';
                tableOptions = `CLUSTER BY (${sortColumns})` ;
                partitionOptions = '';
            break;
            default:
                checksumOptions = `bytea generated always as (cast(MD5(cast(${attribute.valueColumnName} as text)) as bytea)) stored`;
                indexOptions = '';
                tableOptions = '';
                partitionOptions = '';
        }
        
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange NOT NULL,
    $attribute.valueColumnName $attribute.dataRange NOT NULL,
    $(attribute.hasChecksum())? $attribute.checksumColumnName $checksumOptions,
    $attribute.changingColumnName $attribute.timeRange NOT NULL,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType NOT NULL, : $attribute.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.anchorReferenceName ,
        $attribute.changingColumnName
    ) $indexOptions
) $tableOptions $(attribute.isEquivalent())? $partitionOptions
;
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $attribute.knotReferenceName $knot.identity NOT NULL,
    $attribute.changingColumnName $attribute.timeRange NOT NULL,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType NOT NULL, : $attribute.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName ,
        $attribute.changingColumnName 
    ) $indexOptions
) $tableOptions
;
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;

/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $attribute.knotReferenceName $knot.identity NOT NULL,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType NOT NULL, : $attribute.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName 
    ) $indexOptions
) $tableOptions
;
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange NOT NULL,
    $attribute.valueColumnName $attribute.dataRange NOT NULL,
    $(attribute.hasChecksum())? $attribute.checksumColumnName $checksumOptions,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType NOT NULL, : $attribute.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName ,
        $attribute.anchorReferenceName 
    ) $indexOptions
) $tableOptions $(attribute.isEquivalent())? $partitionOptions
;

~*/
    }
}}