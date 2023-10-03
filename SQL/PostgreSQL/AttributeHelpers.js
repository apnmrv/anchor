function _attributeColumnNames(attribute) {
    return {
        attributeIdentityColumnName: attribute.identityColumnName,
        attributeAnchorReferenceColumnName: attribute.anchorReferenceName,
        attributeKnotReferenceColumnName: attribute.knotReferenceName,
        attributeValueColumnName: attribute.valueColumnName,
        attributeChangingColumnName: attribute.changingColumnName,
        attributeChecksumColumnName: attribute.checksumColumnName,
        attributePositingColumnName: attribute.positingColumnName,
        attributePositorColumnName: attribute.positorColumnName,
        attributeReliabilityColumnName: attribute.reliabilityColumnName,
        attributeAssertionColumnName: attribute.assertionColumnName,
        attributeMetadataColumnName: attribute.metadataColumnName
    }
}

function _attributeColumnNamesQuoted(attribute) {
    var _columnNames = _attributeColumnNames(attribute);
    return {
        attributeIdentityColumnNameQuoted: quoted(_columnNames.attributeIdentityColumnName),
        attributeAnchorReferenceColumnNameQuoted: quoted(_columnNames.attributeAnchorReferenceColumnName),
        attributeKnotReferenceColumnNameQuoted: quoted(_columnNames.attributeKnotReferenceColumnName),
        attributeValueColumnNameQuoted: quoted(_columnNames.attributeValueColumnName),
        attributeChangingColumnNameQuoted: quoted(_columnNames.attributeChangingColumnName),
        attributeChecksumColumnNameQuoted: quoted(_columnNames.attributeChecksumColumnName),
        attributePositingColumnNameQuoted: quoted(_columnNames.attributePositingColumnName),
        attributePositorColumnNameQuoted: quoted(_columnNames.attributePositorColumnName),
        attributeReliabilityColumnNameQuoted: quoted(_columnNames.attributeReliabilityColumnName),
        attributeAssertionColumnNameQuoted: quoted(_columnNames.attributeAssertionColumnName),
        attributeMetadataColumnNameQuoted: quoted(_columnNames.attributeMetadataColumnName)
    }
}

function _attributeTableNames(attribute) {
    return {
        attributeName: attribute.name,
        attributePositName: attribute.positName,
        attributeAnnexName: attribute.annexName,
        attributePositRewinderName: "r" + this.attributePositName,
        attributePostForwarderName: "f" + this.attributePositName,
        attributeAnnexRewinderName: "r" + this.attributeAnnexName,
        attributeAssembledRewinderName: "r" + this.attributeName,
        attributeAssembledForwarderName: "f" + this.attributeName,
        attributePreviousName: "pre" + this.attributeName,
        attributeFollowingName: "fol" + this.attributeName
    }
}

function _attributeTableNamesQuoted(attribute) {
    var _tableNames = _attributeTableNames(attribute);
    return {
        attributeNameQuoted: quoted(_tableNames.attributeName),
        attributePositNameQuoted: quoted(_tableNames.attributePositName),
        attributeAnnexNameQuoted: quoted(_tableNames.attributeAnnexName),
        attributePositRewinderNameQuoted: quoted(_tableNames.attributePositRewinderName),
        attributePositForwarderNameQuoted: quoted(_tableNames.attributePostForwarderName),
        attributeAnnexRewinderNameQuoted: quoted(_tableNames.attributeAnnexRewinderName),
        attributeAssembledRewinderNameQuoted: quoted(_tableNames.attributeAssembledRewinderName),
        attributeAssembledForwarderNameQuoted: quoted(_tableNames.attributeAssembledForwarderName),
        attributePreviousNameQuoted: quoted(_tableNames.attributePreviousName),
        attributeFollowingNameQuoted: quoted(_tableNames.attributeFollowingName)
    }
}

function _attributeConstraintNamesQuoted(attribute) {
    var _tableNames = _attributeTableNames(attribute);
    return {
        fkAttributeNameQuoted: quoted("fk" + _tableNames.attributeName),
        fkAttributePositNameQuoted: quoted("fk" + _tableNames.attributePositName),
        fkAnchorAttributePositNameQuoted: quoted("fk_A_" + _tableNames.attributePositName),
        fkKnotAttributePositNameQuoted: quoted("fk_K_" + _tableNames.attributePositName),
        pkAttributePositNameQuoted: quoted("pk" + _tableNames.attributePositName),
        uqAttributePositNameQuoted: quoted("uq" + _tableNames.attributePositName),
        fkAttributeAnnexNameQuoted: quoted("fk" + _tableNames.attributeAnnexName),
        pkAttributeAnnexNameQuoted: quoted("pk" + _tableNames.attributeAnnexName),
        idxAttributeAnnexNameQuoted: quoted("idx" + _tableNames.attributeAnnexName)
    }
}

function _attributeColumnDDLs(attribute, schemaMetadata) {
    var _columnNamesQuoted = _attributeColumnNamesQuoted(attribute);
    return {
        attributeIdentityColumnDDL: toDdlExpr(_columnNamesQuoted.attributeIdentityColumnNameQuoted, attribute.identity, attribute.identityGenerator, notNullDDL),
        attributePositingColumnDDL: toDdlExpr(_columnNamesQuoted.attributePositingColumnNameQuoted, schemaMetadata.positingRange, notNullDDL),
        attributePositorColumnDDL: toDdlExpr(_columnNamesQuoted.attributePositorColumnNameQuoted, schemaMetadata.positingRange, notNullDDL),
        attributeReliabilityColumnDDL: toDdlExpr(_columnNamesQuoted.attributeReliabilityColumnNameQuoted, schemaMetadata.reliabilityRange, notNullDDL),
        attributeValueColumnDDL: toDdlExpr(_columnNamesQuoted.attributeValueColumnNameQuoted, attribute.dataRange, notNullDDL),
        attributeChecksumColumnDDL: toDdlExpr(
            _columnNamesQuoted.attributeChecksumColumnNameQuoted,
            "bytea",
            "generated always as",
            "(cast(MD5(cast(" + attribute.valueColumnName + " as text)) as bytea))",
            "stored"
        ),
        attributeChangingColumnDDL: toDdlExpr(_columnNamesQuoted.attributeChangingColumnNameQuoted, attribute.timeRange, notNullDDL),
        attributeMetadataColumnDDL: toDdlExpr(
            _columnNamesQuoted.attributeMetadataColumnNameQuoted,
            schemaMetadata.metadataType,
            notNullDDL
        ),
        attributeAssertionColumnDDL: toDdlExpr(_columnNamesQuoted.attributeAssertionColumnNameQuoted, "char(1)", notNullDDL)
    }
}

function attributeDDL(attribute, schemaMetadata) {
    var _tableNames = _attributeTableNames(attribute);
    var _tableNamesQuoted = _attributeTableNamesQuoted(attribute);
    var _constraintDDLs = _attributeConstraintNamesQuoted(attribute);
    var _columnDDLs = _attributeColumnDDLs(attribute, schemaMetadata);
    var _columnNames = _attributeColumnNames(attribute);
    var _columnNamesQuoted = _attributeColumnNamesQuoted(attribute);

    return {
        // table names
        attributePositName: _tableNames.attributePositName,
        attributeAnnexName: _tableNames.attributeAnnexName,
        attributePositRewinderName: _tableNames.attributePositRewinderName,
        attributePositForwarderName: _tableNames.attributePositForwarderName,
        attributeAnnexRewinderName: _tableNames.attributeAnnexRewinderName,
        attributeAssembledRewinderName: _tableNames.attributeAssembledRewinderName,
        attributeAssembledForwarderName: _tableNames.attributeAssembledForwarderName,
        attributePreviousName: _tableNames.attributePreviousName,
        attributeFollowingName: _tableNames.attributeFollowingName,
        // table names quoted
        attributePositNameQuoted: _tableNamesQuoted.attributePositNameQuoted,
        attributeAnnexNameQuoted: _tableNamesQuoted.attributeAnnexNameQuoted,
        attributePositRewinderNameQuoted: _tableNamesQuoted.attributePositRewinderNameQuoted,
        attributePositForwarderNameQuoted: _tableNamesQuoted.attributePositForwarderNameQuoted,
        attributeAnnexRewinderNameQuoted: _tableNamesQuoted.attributeAnnexRewinderNameQuoted,
        attributeAnnexForwarderNameQuoted: _tableNamesQuoted.attributeAnnexForwarderNameQuoted,
        attributeAssembledRewinderNameQuoted: _tableNamesQuoted.attributeAssembledRewinderNameQuoted,
        attributeAssembledForwarderNameQuoted: _tableNamesQuoted.attributeAssembledForwarderNameQuoted,
        attributePreviousNameQuoted: _tableNamesQuoted.attributePreviousNameQuoted,
        attributeFollowingNameQuoted: _tableNamesQuoted.attributeFollowingNameQuoted,
        // column names
        attributeIdentityColumnName: _columnNames.attributeIdentityColumnName,
        attributeAnchorReferenceColumnName: _columnNames.attributeAnchorReferenceColumnName,
        attributeKnotReferenceColumnName: _columnNames.attributeKnotReferenceColumnName,
        attributeValueColumnName: _columnNames.attributeValueColumnName,
        attributeChangingColumnName: _columnNames.attributeChangingColumnName,
        attributeChecksumColumnName: _columnNames.attributeChecksumColumnName,
        attributePositingColumnName: _columnNames.attributePositingColumnName,
        attributePositorColumnName: _columnNames.attributePositorColumnName,
        attributeReliabilityColumnName: _columnNames.attributeReliabilityColumnName,
        attributeAssertionColumnName: _columnNames.attributeAssertionColumnName,
        attributeMetadataColumnName: _columnNames.attributeMetadataColumnName,
        // column names quoted
        attributeIdentityColumnNameQuoted: _columnNamesQuoted.attributeIdentityColumnNameQuoted,
        attributeAnchorReferenceColumnNameQuoted: _columnNamesQuoted.attributeAnchorReferenceColumnNameQuoted,
        attributeKnotReferenceColumnNameQuoted: _columnNamesQuoted.attributeKnotReferenceColumnNameQuoted,
        attributeValueColumnNameQuoted: _columnNamesQuoted.attributeValueColumnNameQuoted,
        attributeChangingColumnNameQuoted: _columnNamesQuoted.attributeChangingColumnNameQuoted,
        attributeChecksumColumnNameQuoted: _columnNamesQuoted.attributeChecksumColumnNameQuoted,
        attributePositingColumnNameQuoted: _columnNamesQuoted.attributePositingColumnNameQuoted,
        attributePositorColumnNameQuoted: _columnNamesQuoted.attributePositorColumnNameQuoted,
        attributeReliabilityColumnNameQuoted: _columnNamesQuoted.attributeReliabilityColumnNameQuoted,
        attributeAssertionColumnNameQuoted: _columnNamesQuoted.attributeAssertionColumnNameQuoted,
        attributeMetadataColumnNameQuoted: _columnNamesQuoted.attributeMetadataColumnNameQuoted,
        // constraint names quoted
        fkAttributeNameQuoted: _constraintDDLs.fkAttributeNameQuoted,
        fkAttributePositNameQuoted: _constraintDDLs.fkAttributePositNameQuoted,
        fkAnchorAttributePositNameQuoted: _constraintDDLs.fkAnchorAttributePositNameQuoted,
        fkKnotAttributePositNameQuoted: _constraintDDLs.fkKnotAttributePositNameQuoted,
        pkAttributePositNameQuoted: _constraintDDLs.pkAttributePositNameQuoted,
        uqAttributePositNameQuoted: _constraintDDLs.uqAttributePositNameQuoted,
        fkAttributeAnnexNameQuoted: _constraintDDLs.fkAttributeAnnexNameQuoted,
        pkAttributeAnnexNameQuoted: _constraintDDLs.pkAttributeAnnexNameQuoted,
        idxAttributeAnnexNameQuoted: _constraintDDLs.idxAttributeAnnexNameQuoted,
        // column DDLs
        attributeIdentityColumnDDL: _columnDDLs.attributeIdentityColumnDDL,
        attributePositingColumnDDL: _columnDDLs.attributePositingColumnDDL,
        attributePositorColumnDDL: _columnDDLs.attributePositorColumnDDL,
        attributeReliabilityColumnDDL: _columnDDLs.attributeReliabilityColumnDDL,
        attributeValueColumnDDL: _columnDDLs.attributeValueColumnDDL,
        attributeChangingColumnDDL: _columnDDLs.attributeChangingColumnDDL,
        attributeChecksumColumnDDL: _columnDDLs.attributeChecksumColumnDDL,
        attributeMetadataColumnDDL: _columnDDLs.attributeMetadataColumnDDL,
        attributeAssertionColumnDDL: _columnDDLs.attributeAssertionColumnDDL
    }
}