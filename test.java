public class checkstyle {

    @SuppressWarnings("unused")
    public void importantMethod() {
        try {
            throw new RuntimeException("error");
        } catch (Exception ex) {
            // ignore
        }
    }
}