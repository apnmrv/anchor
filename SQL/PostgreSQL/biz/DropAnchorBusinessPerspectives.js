if(schema.BUSINESS_VIEWS) {
/*~
-- ANCHOR TEMPORAL BUSINESS PERSPECTIVES ------------------------------------------------------------------------------
--
~*/
    var anchor;
    while (anchor = schema.nextAnchor()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
~*/
        if(schema.EQUIVALENCE) {
/*~
DROP FUNCTION IF EXISTS "$anchor.capsule"\."EQ_Difference_$anchor.businessName";
DROP FUNCTION IF EXISTS "$anchor.capsule"\."EQ_Current_$anchor.businessName";
DROP FUNCTION IF EXISTS "$anchor.capsule"\."EQ_Point_$anchor.businessName";
DROP FUNCTION IF EXISTS "$anchor.capsule"\."EQ_Latest_$anchor.businessName";
~*/
        }
/*~
DROP FUNCTION IF EXISTS "$anchor.capsule"\."Difference_$anchor.businessName";
DROP VIEW IF EXISTS "$anchor.capsule"\."Current_$anchor.businessName";
DROP FUNCTION IF EXISTS "$anchor.capsule"\."Point_$anchor.businessName";
DROP VIEW IF EXISTS "$anchor.capsule"."Latest_$anchor.businessName";
~*/
    }
}