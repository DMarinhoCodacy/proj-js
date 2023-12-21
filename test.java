public class checkstyle {

    @SuppressWarnings("all")
    public void importantMethod() {
        try {
            throw new RuntimeException("error");
        } catch (Exception ex) {
            // ignore
        }
    }
}