function _anchorColumnNames(anchor) {
    return {
        anchorIdentityColumnName: anchor.identityColumnName,
        anchorMetadataColumnName: anchor.metadataColumnName,
        anchorDummyColumnName: anchor.dummyColumnName
    }
}

function _anchorColumnNamesQuoted(attribute) {
    var _columnNames = _anchorColumnNames(attribute);
    return {
        anchorIdentityColumnNameQuoted: quoted(_columnNames.anchorIdentityColumnName),
        anchorMetadataColumnNameQuoted: quoted(_columnNames.anchorMetadataColumnName),
        anchorDummyColumnNameQuoted: quoted(_columnNames.anchorDummyColumnName)
    }
}

function _anchorTableNames(anchor) {
    return {
        anchorName: anchor.name
    }
}

function _anchorTableNamesQuoted(anchor) {
    var _tableNames = _anchorTableNames(anchor);
    return {
        anchorNameQuoted: quoted(_tableNames.anchorName)
    }
}

function _anchorConstraintNamesQuoted(attribute) {
    var _tableNames = _anchorTableNames(attribute);
    return {
        pkAnchorNameQuoted: quoted("pk" + _tableNames.anchorName)
    }
}

function _anchorColumnDDLs(anchor, schemaMetadata) {
    var _columnNamesQuoted = _anchorColumnNamesQuoted(anchor);
    var _anchorIdentityGenerator = anchor.isGenerator() ? schemaMetadata.identityProperty : "";
    return {
        anchorIdentityColumnDDL: toDdlExpr(_columnNamesQuoted.anchorIdentityColumnNameQuoted, anchor.identity, _anchorIdentityGenerator),
        anchorMetadataColumnDDL: toDdlExpr(_columnNamesQuoted.anchorMetadataColumnNameQuoted, schemaMetadata.metadataType, notNullDDL),
        anchorDummyColumnDDL: toDdlExpr(_columnNamesQuoted.anchorDummyColumnNameQuoted, "boolean", "null")

    }
}

function anchorDDL(attribute, schemaMetadata) {
    var _tableNames = _anchorTableNames(attribute);
    var _tableNamesQuoted = _anchorTableNamesQuoted(attribute);
    var _columnNames = _anchorColumnNames(anchor);
    var _columnNamesQuoted = _anchorColumnNamesQuoted(anchor);
    var _columnDDLs = _anchorColumnDDLs(anchor, schemaMetadata);
    var _constraintNamesQuoted = _anchorConstraintNamesQuoted(attribute);
    return {
        // table names
        anchorName: _tableNames.anchorName,
        // table names quoted
        anchorNameQuoted: _tableNamesQuoted.anchorNameQuoted,

        // column names
        anchorIdentityColumnName: _columnNames.anchorIdentityColumnName,
        anchorDummyColumnName: _columnNames.anchorDummyColumnName,
        anchorMetadataColumnName: _columnNames.anchorMetadataColumnName,

        // column names quoted
        anchorIdentityColumnNameQuoted: _columnNamesQuoted.anchorIdentityColumnNameQuoted,
        anchorDummyColumnNameQuoted: _columnNamesQuoted.anchorDummyColumnNameQuoted,
        anchorMetadataColumnNameQuoted: _columnNamesQuoted.anchorMetadataColumnNameQuoted,

        // constraint names quoted
        pkAnchorNameQuoted: _constraintNamesQuoted.pkAnchorNameQuoted,

        // column DDLs
        anchorIdentityColumnDDL: _columnDDLs.anchorIdentityColumnDDL,
        anchorMetadataColumnDDL: _columnDDLs.anchorMetadataColumnDDL,
        anchorDummyColumnDDL: _columnDDLs.anchorDummyColumnDDL
    }
}