public class checkstyle {
    public void importantMethod() {
        try {
            throw new RuntimeException("error");
        } catch (Exception ex) {
            // ignore
        }
    }
}


//this is a test