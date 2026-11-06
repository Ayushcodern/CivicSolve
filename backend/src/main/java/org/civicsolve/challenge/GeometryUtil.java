package org.civicsolve.challenge;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

/**
 * Utility for constructing JTS geometries in SRID 4326 (WGS 84).
 */
public final class GeometryUtil {

    private static final GeometryFactory FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private GeometryUtil() {
    }

    /**
     * Create a Point geometry with SRID 4326.
     * Note: JTS coordinates use (X=longitude, Y=latitude).
     *
     * @param lat Latitude (-90 to +90)
     * @param lon Longitude (-180 to +180)
     * @return Point geometry in EPSG:4326
     */
    public static Point createPoint(double lat, double lon) {
        Point point = FACTORY.createPoint(new Coordinate(lon, lat));
        point.setSRID(4326);
        return point;
    }
}
