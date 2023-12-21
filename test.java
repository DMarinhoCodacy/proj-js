public class checkstyle {

    
    public void importantMethod() {
        try {
            throw new RuntimeException("error");
            @SuppressWarnings("all")
        } catch (Exception ex) {
            // ignore
        }
    }
}