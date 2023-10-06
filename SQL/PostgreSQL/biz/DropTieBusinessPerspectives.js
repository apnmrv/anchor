if(schema.BUSINESS_VIEWS) {
/*~
-- TIE TEMPORAL BUSINESS PERSPECTIVES ---------------------------------------------------------------------------------
--
~*/
    var tie, role, knot;
    while (tie = schema.nextTie()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
~*/
        if(schema.EQUIVALENCE) {
/*~
DROP FUNCTION IF EXISTS "$tie.capsule"\."EQ_Difference_$tie.businessName";
DROP FUNCTION IF EXISTS "$tie.capsule"\."EQ_Current_$tie.businessName";
DROP FUNCTION IF EXISTS "$tie.capsule"\."EQ_Point_$tie.businessName";
DROP FUNCTION IF EXISTS "$tie.capsule"\."EQ_Latest_$tie.businessName";
~*/
        }
/*~
DROP FUNCTION IF EXISTS "$tie.capsule"\."Difference_$tie.businessName";
DROP VIEW IF EXISTS "$tie.capsule"\."Current_$tie.businessName";
DROP FUNCTION IF EXISTS "$tie.capsule"\."Point_$tie.businessName";
DROP VIEW IF EXISTS "$tie.capsule"\."Latest_$tie.businessName";
~*/
    }
}